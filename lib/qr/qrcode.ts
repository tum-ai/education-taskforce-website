import "server-only";

import QRCode from "qrcode";
import {
  createLangdockQrPayload,
  createLoginQrPayload,
  createLovableQrPayload,
  createStaticQrPayload,
} from "@/lib/qr/payload";

const qrOptions = {
  width: 220,
  margin: 1,
  color: {
    dark: "#1B0049",
    light: "#FFFFFF",
  },
} as const;

export async function createLoginQrDataUrl(username: string): Promise<{ payload: string; dataUrl: string }> {
  const payload = createLoginQrPayload(username, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const dataUrl = await QRCode.toDataURL(payload, qrOptions);

  return { payload, dataUrl };
}

export async function createLangdockQrDataUrl(
  scanToken: string,
  siteUrl: string,
): Promise<{ payload: string; dataUrl: string }> {
  const payload = createLangdockQrPayload(scanToken, siteUrl);
  const dataUrl = await QRCode.toDataURL(payload, qrOptions);

  return { payload, dataUrl };
}

export async function createLovableQrDataUrl(
  scanToken: string,
  siteUrl: string,
): Promise<{ payload: string; dataUrl: string }> {
  const payload = createLovableQrPayload(scanToken, siteUrl);
  const dataUrl = await QRCode.toDataURL(payload, qrOptions);

  return { payload, dataUrl };
}

export async function createStaticQrDataUrl(targetUrl: string): Promise<{ payload: string; dataUrl: string }> {
  const payload = createStaticQrPayload(targetUrl);
  const dataUrl = await QRCode.toDataURL(payload, qrOptions);

  return { payload, dataUrl };
}
