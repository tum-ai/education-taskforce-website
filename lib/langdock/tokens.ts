import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getAdminSupabaseEnv } from "@/lib/supabase/env";

const TOKEN_VERSION = "v1";

export type LangdockScanTokenParts = {
  id: string;
  nonce: string;
};

export function createLangdockScanNonce(): string {
  return randomBytes(18).toString("base64url");
}

export function createLangdockScanToken(parts: LangdockScanTokenParts): string {
  const payload = tokenPayload(parts);
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifyLangdockScanToken(token: string): LangdockScanTokenParts | null {
  const parts = token.split(".");

  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION || !parts[1] || !parts[2] || !parts[3]) {
    return null;
  }

  const payload = parts.slice(0, 3).join(".");
  const expectedSignature = signPayload(payload);

  if (!safeEqual(parts[3], expectedSignature)) {
    return null;
  }

  return {
    id: parts[1],
    nonce: parts[2],
  };
}

function tokenPayload({ id, nonce }: LangdockScanTokenParts): string {
  return `${TOKEN_VERSION}.${id}.${nonce}`;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getTokenSecret()).update(payload).digest("base64url");
}

function getTokenSecret(): string {
  return process.env.LANGDOCK_QR_SIGNING_SECRET ?? getAdminSupabaseEnv().secretKey;
}

function safeEqual(first: string, second: string): boolean {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}
