import { createClient } from "@supabase/supabase-js";

const INTERNAL_EMAIL_DOMAIN = "internal.education-taskforce.local";
const usernamePattern = /^[a-z0-9][a-z0-9._-]{1,62}[a-z0-9]$/;

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
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

const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const username = normalizeUsername(required("ADMIN_USERNAME"));
const displayName = process.env.ADMIN_DISPLAY_NAME ?? "Course Admin";
const password = required("ADMIN_PASSWORD");

if (!secretKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const email = usernameToInternalEmail(username);
const { data: authData, error: authError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    username,
    display_name: displayName,
    role: "admin",
  },
});

if (authError || !authData.user) {
  throw new Error(authError?.message ?? "Could not create admin auth user.");
}

const { error: accountError } = await admin.from("accounts").upsert({
  id: authData.user.id,
  username,
  display_name: displayName,
  role: "admin",
});

if (accountError) {
  await admin.auth.admin.deleteUser(authData.user.id);
  throw new Error(accountError.message);
}

console.log(`Admin account created for ${username}.`);
console.log(`Supabase user id: ${authData.user.id}`);
console.log(`Publishable key configured: ${Boolean(publishableKey)}`);
