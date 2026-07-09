import "server-only";

import { headers } from "next/headers";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

export async function canRenderLocalPreview() {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const host = (await headers()).get("host") ?? "";
  const hostname = host.split(":")[0];

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
    return true;
  }

  return !getPublicSupabaseEnv();
}
