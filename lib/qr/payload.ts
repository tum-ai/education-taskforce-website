import { normalizeUsername } from "@/lib/validation/auth";

export function createLoginQrPayload(username: string, siteUrl: string): string {
  const base = siteUrl || "http://localhost:3000";
  const url = new URL("/login", base);
  url.searchParams.set("u", normalizeUsername(username));
  return url.toString();
}

export function createLangdockQrPayload(scanToken: string, siteUrl: string): string {
  const base = siteUrl || "http://localhost:3000";
  const url = new URL(`/k/${encodeURIComponent(scanToken)}`, base);
  return url.toString();
}
