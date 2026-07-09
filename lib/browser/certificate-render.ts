import html2canvas from "html2canvas";
import { createCertificateImagePdf, type CertificateContent } from "@/lib/domain/certificate";

const CERTIFICATE_PDF_WIDTH = 842;

function dataUrlToBytes(dataUrl: string) {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
  });
}

async function waitForCertificateAssets(element: HTMLElement) {
  await document.fonts?.ready;
  await Promise.all(Array.from(element.querySelectorAll("img")).map(waitForImage));
}

function freezeClonedCertificateSize(width: number, height: number) {
  return (_document: Document, clonedElement: HTMLElement) => {
    clonedElement.style.width = `${width}px`;
    clonedElement.style.height = `${height}px`;
    clonedElement.style.minHeight = `${height}px`;
    clonedElement.style.boxSizing = "border-box";
  };
}

export async function createCertificatePdfFromElement(element: HTMLElement, content: CertificateContent) {
  void content;
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  if (width <= 0 || height <= 0) {
    throw new Error("Certificate preview must be visible before it can be downloaded.");
  }

  await waitForCertificateAssets(element);

  const canvas = await html2canvas(element, {
    backgroundColor: null,
    height,
    logging: false,
    onclone: freezeClonedCertificateSize(width, height),
    scale: Math.min(Math.max(window.devicePixelRatio || 1, 2), 3),
    scrollX: Math.ceil(window.scrollX || 0),
    scrollY: Math.ceil(window.scrollY || 0),
    useCORS: true,
    width,
    windowHeight: Math.ceil(window.innerHeight || document.documentElement.clientHeight || height),
    windowWidth: Math.ceil(window.innerWidth || document.documentElement.clientWidth || width),
  });
  const imageBytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.98));
  const pageHeight = CERTIFICATE_PDF_WIDTH * (canvas.height / canvas.width);

  return createCertificateImagePdf({
    imageBytes,
    imageHeight: canvas.height,
    imageWidth: canvas.width,
    pageHeight,
    pageWidth: CERTIFICATE_PDF_WIDTH,
  });
}
