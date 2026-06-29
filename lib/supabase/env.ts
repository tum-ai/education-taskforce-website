export type PublicSupabaseEnv = {
  url: string;
  publishableKey: string;
};

export type AdminSupabaseEnv = PublicSupabaseEnv & {
  secretKey: string;
};

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function getRequiredPublicSupabaseEnv(): PublicSupabaseEnv {
  const env = getPublicSupabaseEnv();

  if (!env) {
    throw new Error(
      "Missing Supabase public environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return env;
}

export function getAdminSupabaseEnv(): AdminSupabaseEnv {
  const publicEnv = getRequiredPublicSupabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    throw new Error("Missing server-only Supabase key. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { ...publicEnv, secretKey };
}
