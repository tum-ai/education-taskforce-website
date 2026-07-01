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

export function createLovableQrPayload(scanToken: string, siteUrl: string): string {
  const base = siteUrl || "http://localhost:3000";
  const url = new URL(`/lovable-k/${encodeURIComponent(scanToken)}`, base);
  return url.toString();
}

export function createStaticQrPayload(targetUrl: string): string {
  const url = new URL(targetUrl.trim());

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Static QR target must use http or https.");
  }

  return url.toString();
}
