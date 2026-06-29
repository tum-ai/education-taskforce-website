import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getAdminSupabaseEnv } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  const env = getAdminSupabaseEnv();

  return createClient(env.url, env.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
