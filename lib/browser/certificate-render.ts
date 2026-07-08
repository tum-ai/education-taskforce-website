import {
  createCertificateImagePdf,
  type CertificateContent,
} from "@/lib/domain/certificate";

const CERTIFICATE_PDF_WIDTH = 842;
const TUM_AI_LOGO_PATH = "/brand-assets/TUM.ai logo dark purple color.svg";
const SCHLOSS_ELMAU_LOGO_PATH = "/brand-assets/Schloss-Elmau-Logo-Black.png";

type CertificateRenderSize = {
  height: number;
  width: number;
};

type CertificateRenderAssets = {
  schlossElmauLogo?: CanvasImageSource;
  tumAiLogo?: CanvasImageSource;
};

type WrappedLine = {
  text: string;
  width: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function dataUrlToBytes(dataUrl: string) {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function setFont(context: CanvasRenderingContext2D, size: number, weight = 700) {
  context.font = `${weight} ${size}px Manrope, Arial, sans-serif`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load certificate asset: ${src}`));
    image.src = src;
  });
}

async function loadCertificateAssets(): Promise<CertificateRenderAssets> {
  const [tumAiLogo, schlossElmauLogo] = await Promise.allSettled([
    loadImage(TUM_AI_LOGO_PATH),
    loadImage(SCHLOSS_ELMAU_LOGO_PATH),
  ]);

  return {
    schlossElmauLogo: schlossElmauLogo.status === "fulfilled" ? schlossElmauLogo.value : undefined,
    tumAiLogo: tumAiLogo.status === "fulfilled" ? tumAiLogo.value : undefined,
  };
}

function roundedRectPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: WrappedLine[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    const nextWidth = context.measureText(next).width;

    if (current && nextWidth > maxWidth) {
      lines.push({ text: current, width: context.measureText(current).width });
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push({ text: current, width: context.measureText(current).width });
  }

  return lines;
}

function wrapBalancedCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const totalWidth = context.measureText(text).width;
  const targetLineCount = Math.max(1, Math.ceil(totalWidth / maxWidth));

  if (targetLineCount === 1 || words.length <= 2) {
    return wrapCanvasText(context, text, maxWidth);
  }

  const targetWidth = totalWidth / targetLineCount;
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (current && lines.length < targetLineCount - 1 && context.measureText(next).width > targetWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.flatMap((line) => wrapCanvasText(context, line, maxWidth));
}

function drawCenteredLines(
  context: CanvasRenderingContext2D,
  lines: WrappedLine[],
  centerX: number,
  startY: number,
  lineHeight: number,
) {
  context.textAlign = "center";
  lines.forEach((line, index) => {
    context.fillText(line.text, centerX, startY + index * lineHeight);
  });
}

function drawLeftLines(
  context: CanvasRenderingContext2D,
  lines: WrappedLine[],
  x: number,
  startY: number,
  lineHeight: number,
) {
  context.textAlign = "left";
  lines.forEach((line, index) => {
    context.fillText(line.text, x, startY + index * lineHeight);
  });
}

function getNumericDimension(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function getImageSourceSize(logo: CanvasImageSource) {
  const source = logo as {
    height?: unknown;
    naturalHeight?: unknown;
    naturalWidth?: unknown;
    videoHeight?: unknown;
    videoWidth?: unknown;
    width?: unknown;
  };

  return {
    height:
      getNumericDimension(source.naturalHeight) ||
      getNumericDimension(source.videoHeight) ||
      getNumericDimension(source.height),
    width:
      getNumericDimension(source.naturalWidth) ||
      getNumericDimension(source.videoWidth) ||
      getNumericDimension(source.width),
  };
}

function getContainedImageSize(logo: CanvasImageSource, maxWidth: number, maxHeight: number) {
  const intrinsic = getImageSourceSize(logo);

  if (!intrinsic.width || !intrinsic.height) {
    return { height: maxHeight, width: maxWidth };
  }

  const scale = Math.min(maxWidth / intrinsic.width, maxHeight / intrinsic.height);

  return {
    height: intrinsic.height * scale,
    width: intrinsic.width * scale,
  };
}

function drawLogoOrFallback(
  context: CanvasRenderingContext2D,
  logo: CanvasImageSource | undefined,
  fallbackText: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  if (logo) {
    const size = getContainedImageSize(logo, maxWidth, maxHeight);
    context.drawImage(logo, x, y + (maxHeight - size.height) / 2, size.width, size.height);
    return;
  }

  setFont(context, 18, 900);
  context.fillStyle = "rgb(26, 0, 70)";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(fallbackText, x, y + maxHeight / 2);
}

function drawCertificateBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  const radius = 12;

  context.save();
  roundedRectPath(context, 0, 0, width, height, radius);
  context.clip();

  const base = context.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "rgb(252, 250, 255)");
  base.addColorStop(0.5, "rgb(255, 255, 255)");
  base.addColorStop(1, "rgb(250, 253, 252)");
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  context.restore();

  roundedRectPath(context, 10, 10, width - 20, height - 20, radius);
  context.strokeStyle = "rgba(26, 0, 70, 0.72)";
  context.lineWidth = 3;
  context.stroke();

  roundedRectPath(context, 22, 22, width - 44, height - 44, radius - 2);
  context.strokeStyle = "rgba(154, 100, 217, 0.38)";
  context.lineWidth = 1.5;
  context.stroke();
}

function fitFontSize(context: CanvasRenderingContext2D, text: string, initialSize: number, maxWidth: number, weight: number) {
  let size = initialSize;
  setFont(context, size, weight);

  while (size > 40 && context.measureText(text).width > maxWidth) {
    size -= 2;
    setFont(context, size, weight);
  }

  return size;
}

function drawCertificate(
  context: CanvasRenderingContext2D,
  content: CertificateContent,
  width: number,
  height: number,
  assets: CertificateRenderAssets,
) {
  const centerX = width / 2;
  const padding = clamp(width * 0.06, 34, 76);
  const contentWidth = width - padding * 2;
  const gap = 26;
  const brandHeight = 44;
  const brandWidth = 120;
  const titleSize = clamp(width * 0.07, 48, 106);
  const statementSize = clamp(width * 0.02, 19, 25);
  const descriptionSize = clamp(width * 0.015, 16, 19);
  const footerLogoWidth = 156;
  const footerLogoHeight = 48;
  const footerLogoGap = 12;
  const footerSize = 15;
  const footerStrongSize = 16;

  setFont(context, statementSize, 500);
  const statementLines = wrapBalancedCanvasText(context, content.statement, Math.min(820, contentWidth));
  setFont(context, descriptionSize, 500);
  const descriptionLines = wrapBalancedCanvasText(context, content.description, Math.min(860, contentWidth));
  setFont(context, footerSize, 500);
  const footerColumnWidth = (contentWidth - 18) / 2;
  const leftFooterLines = wrapCanvasText(context, content.footerLeft, footerColumnWidth);
  const rightFooterLines = wrapCanvasText(context, content.footerRight, footerColumnWidth);

  const statementLineHeight = statementSize * 1.55;
  const descriptionLineHeight = descriptionSize * 1.55;
  const footerLineHeight = footerSize * 1.35;
  const footerHeight =
    1 +
    22 +
    footerLogoHeight +
    footerLogoGap +
    footerStrongSize * 1.25 +
    4 +
    Math.max(leftFooterLines.length, rightFooterLines.length) * footerLineHeight;
  const blockHeight =
    brandHeight +
    gap +
    18 +
    gap +
    titleSize +
    gap +
    statementLines.length * statementLineHeight +
    gap +
    descriptionLines.length * descriptionLineHeight +
    20 +
    footerHeight;
  let y = Math.max(padding, (height - blockHeight) / 2);

  drawCertificateBackground(context, width, height);

  roundedRectPath(context, centerX - brandWidth / 2, y, brandWidth, brandHeight, 10);
  context.fillStyle = "rgb(26, 0, 70)";
  context.fill();
  setFont(context, 17, 900);
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("TUM.ai", centerX, y + brandHeight / 2 + 1);
  y += brandHeight + gap;

  setFont(context, 15, 900);
  context.fillStyle = "rgb(82, 53, 115)";
  context.textBaseline = "alphabetic";
  context.fillText(content.subtitle.toUpperCase(), centerX, y + 15);
  y += 18 + gap;

  const fittedTitleSize = fitFontSize(context, content.participantName, titleSize, contentWidth, 900);
  context.fillStyle = "rgb(26, 0, 70)";
  context.textBaseline = "alphabetic";
  context.fillText(content.participantName, centerX, y + fittedTitleSize * 0.86);
  y += fittedTitleSize + gap;

  setFont(context, statementSize, 500);
  context.fillStyle = "rgb(75, 72, 86)";
  drawCenteredLines(context, statementLines, centerX, y + statementSize, statementLineHeight);
  y += statementLines.length * statementLineHeight + gap;

  setFont(context, descriptionSize, 500);
  drawCenteredLines(context, descriptionLines, centerX, y + descriptionSize, descriptionLineHeight);
  y += descriptionLines.length * descriptionLineHeight + 20;

  context.strokeStyle = "rgba(82, 53, 115, 0.18)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding, y);
  context.lineTo(width - padding, y);
  context.stroke();
  y += 22;

  const footerRightX = padding + footerColumnWidth + 18;
  drawLogoOrFallback(context, assets.schlossElmauLogo, "Schloss Elmau", padding, y, footerLogoWidth, footerLogoHeight);
  drawLogoOrFallback(context, assets.tumAiLogo, "TUM.ai", footerRightX, y, footerLogoWidth, footerLogoHeight);
  y += footerLogoHeight + footerLogoGap;

  setFont(context, footerStrongSize, 850);
  context.fillStyle = "rgb(26, 0, 70)";
  context.textBaseline = "alphabetic";
  context.textAlign = "left";
  context.fillText(content.courseName, padding, y + footerStrongSize);
  context.fillText(content.organizerName, footerRightX, y + footerStrongSize);

  setFont(context, footerSize, 500);
  context.fillStyle = "rgb(75, 72, 86)";
  drawLeftLines(context, leftFooterLines, padding, y + footerStrongSize + 4 + footerSize, footerLineHeight);
  drawLeftLines(context, rightFooterLines, footerRightX, y + footerStrongSize + 4 + footerSize, footerLineHeight);
}

export async function createCertificatePdfFromContent(
  content: CertificateContent,
  { height, width }: CertificateRenderSize,
  assets?: CertificateRenderAssets,
) {
  await document.fonts?.ready;

  if (width <= 0 || height <= 0) {
    throw new Error("Certificate preview must be visible before it can be downloaded.");
  }

  const scale = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare certificate canvas.");
  }

  context.scale(scale, scale);
  drawCertificate(context, content, width, height, assets ?? (await loadCertificateAssets()));

  const imageBytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.98));
  const pageHeight = CERTIFICATE_PDF_WIDTH * (height / width);

  return createCertificateImagePdf({
    imageBytes,
    imageHeight: canvas.height,
    imageWidth: canvas.width,
    pageHeight,
    pageWidth: CERTIFICATE_PDF_WIDTH,
  });
}

export function createCertificatePdfFromElement(element: HTMLElement, content: CertificateContent) {
  const rect = element.getBoundingClientRect();

  return createCertificatePdfFromContent(content, {
    height: Math.max(760, Math.ceil(rect.height)),
    width: Math.ceil(rect.width),
  });
}
