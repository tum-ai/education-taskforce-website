import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const INTERNAL_EMAIL_DOMAIN = "internal.education-taskforce.local";
const DEFAULT_ADMIN_USERNAME = "admin";
const usernamePattern = /^[a-z0-9][a-z0-9._-]{1,62}[a-z0-9]$/;

function required(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function normalizeSupabaseUrl(name, value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a full project API URL like https://abcdefghijklmnopqrst.supabase.co.`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${name} must start with http:// or https://.`);
  }

  if (url.hostname === "supabase.com" || url.hostname.endsWith(".supabase.com")) {
    throw new Error(
      `${name} is pointing at the Supabase dashboard. Use the project API URL from Project Settings > Data API, like https://abcdefghijklmnopqrst.supabase.co.`,
    );
  }

  if (url.pathname !== "/" && url.pathname !== "") {
    throw new Error(`${name} should not include a path. Use only the project API root, like https://abcdefghijklmnopqrst.supabase.co.`);
  }

  return url.origin;
}

function validateKey(name, value, prefixes) {
  if (!prefixes.some((prefix) => value.startsWith(prefix))) {
    throw new Error(`${name} has an unexpected format. Copy the key from Supabase Project Settings > API / Data API.`);
  }

  return value;
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function usernameToInternalEmail(username) {
  const normalized = normalizeUsername(username);

  if (!usernamePattern.test(normalized)) {
    throw new Error("ADMIN_USERNAME must be 3 to 64 safe username characters.");
  }

  return `${normalized}@${INTERNAL_EMAIL_DOMAIN}`;
}

function generatePassword() {
  return `${randomBytes(24).toString("base64url")}Aa1!`;
}

async function findUserByEmail(admin, email) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error) {
      const message = error.message.includes("Unexpected token '<'")
        ? "Supabase returned HTML instead of JSON. Check that NEXT_PUBLIC_SUPABASE_URL is the project API URL, not the dashboard URL."
        : error.message;

      throw new Error(message);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());

    if (user || data.users.length < perPage) {
      return user ?? null;
    }

    page += 1;
  }
}

const supabaseUrl = normalizeSupabaseUrl("NEXT_PUBLIC_SUPABASE_URL", required("NEXT_PUBLIC_SUPABASE_URL"));
const publishableKey = validateKey("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), [
  "eyJ",
  "sb_publishable_",
]);
const rawSecretKey = process.env.SUPABASE_SECRET_KEY?.trim() ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const username = normalizeUsername(process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME);
const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Course Admin";
const passwordFromEnv = process.env.ADMIN_PASSWORD || undefined;
const password = passwordFromEnv ?? generatePassword();

if (!rawSecretKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");
}

const secretKey = validateKey("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY", rawSecretKey, ["eyJ", "sb_secret_"]);

const admin = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const email = usernameToInternalEmail(username);
const userMetadata = {
  username,
  display_name: displayName,
  role: "admin",
};
const existingUser = await findUserByEmail(admin, email);

let user = existingUser;
let authAction = "updated";

if (existingUser) {
  const { data, error } = await admin.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Could not update admin auth user.");
  }

  user = data.user;
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Could not create admin auth user.");
  }

  user = data.user;
  authAction = "created";
}

const { error: accountError } = await admin.from("accounts").upsert({
  id: user.id,
  username,
  display_name: displayName,
  role: "admin",
});

if (accountError) {
  if (!existingUser) {
    await admin.auth.admin.deleteUser(user.id);
  }

  throw new Error(accountError.message);
}

console.log(`Admin account ${authAction} for username "${username}".`);
console.log(`Supabase user id: ${user.id}`);
console.log(`Publishable key configured: ${Boolean(publishableKey)}`);

if (passwordFromEnv) {
  console.log("Password configured from ADMIN_PASSWORD and not printed.");
} else {
  console.log(`Generated admin password: ${password}`);
}
