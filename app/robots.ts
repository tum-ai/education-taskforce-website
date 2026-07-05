import type { MetadataRoute } from "next";
import { PROTECTED_PREFIXES } from "@/lib/auth/protected-paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Credential scan pages + the API, plus every authenticated area (kept in
        // sync with middleware via PROTECTED_PREFIXES).
        disallow: ["/k/", "/lovable-k/", "/api/", ...PROTECTED_PREFIXES],
      },
    ],
  };
}
