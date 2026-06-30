import "server-only";

import QRCode from "qrcode";
import { createLangdockQrPayload, createLoginQrPayload } from "@/lib/qr/payload";

export async function createLoginQrDataUrl(username: string): Promise<{ payload: string; dataUrl: string }> {
  const payload = createLoginQrPayload(username, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 220,
    margin: 1,
    color: {
      dark: "#1B0049",
      light: "#FFFFFF",
    },
  });

  return { payload, dataUrl };
}

export async function createLangdockQrDataUrl(
  scanToken: string,
  siteUrl: string,
): Promise<{ payload: string; dataUrl: string }> {
  const payload = createLangdockQrPayload(scanToken, siteUrl);
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 220,
    margin: 1,
    color: {
      dark: "#1B0049",
      light: "#FFFFFF",
    },
  });

  return { payload, dataUrl };
}
