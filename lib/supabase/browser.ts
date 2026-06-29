"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getRequiredPublicSupabaseEnv } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const env = getRequiredPublicSupabaseEnv();
  return createBrowserClient(env.url, env.publishableKey);
}
