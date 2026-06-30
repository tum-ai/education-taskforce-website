import "server-only";

import { headers } from "next/headers";

export async function getCurrentRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const forwardedHost = firstHeaderValue(headerStore.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(headerStore.get("host"));

  if (host) {
    const protocol = normalizeProtocol(firstHeaderValue(headerStore.get("x-forwarded-proto")), host);
    return `${protocol}://${host}`;
  }

  return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function isLocalHost(host: string): boolean {
  return host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("[::1]");
}

function normalizeProtocol(value: string | null, host: string): "http" | "https" {
  if (value === "http" || value === "https") {
    return value;
  }

  return isLocalHost(host) ? "http" : "https";
}

function normalizeOrigin(value: string): string {
  return new URL(value).origin;
}
