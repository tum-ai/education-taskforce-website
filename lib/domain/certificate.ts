export const CERTIFICATE_LANGUAGES = ["en", "de"] as const;
export type CertificateLanguage = (typeof CERTIFICATE_LANGUAGES)[number];

export type CertificateDetails = {
  language?: CertificateLanguage;
  participantName: string;
  courseName?: string;
  organizerName?: string;
};

export type CertificateContent = {
  courseName: string;
  description: string;
  footerLeft: string;
  footerRight: string;
  organizerName: string;
  participantName: string;
  statement: string;
  subtitle: string;
  title: string;
};

export type CertificateImagePdfInput = {
  imageBytes: Uint8Array;
  imageHeight: number;
  imageWidth: number;
  pageHeight: number;
  pageWidth: number;
};

export function createEnglishCertificateText(details: CertificateDetails) {
  const courseName = details.courseName ?? "AI Edutainment";
  const organizerName = details.organizerName ?? "TUM.ai";

  return `This certifies that ${details.participantName} has successfully completed the ${courseName} course by ${organizerName}.`;
}

function createGermanCertificateText(details: CertificateDetails) {
  const courseName = details.courseName ?? "AI Edutainment";
  const organizerName = details.organizerName ?? "TUM.ai";

  return `Hiermit wird bestätigt, dass ${details.participantName} den Kurs ${courseName} von ${organizerName} erfolgreich abgeschlossen hat.`;
}

export function createCertificateContent(details: CertificateDetails): CertificateContent {
  const language = details.language ?? "en";
  const courseName = details.courseName ?? "AI Edutainment";
  const organizerName = details.organizerName ?? "TUM.ai";

  if (language === "de") {
    return {
      courseName,
      description:
        "Im Kurs hat die teilnehmende Person KI-Werkzeuge erkundet, Prompts formuliert, Ergebnisse kritisch verglichen, kreative Medien gestaltet und eigene digitale Projekte mit Hilfe von KI vorbereitet und präsentiert.",
      footerLeft: "Fünftägiges Kursprogramm",
      footerRight: "Studierendeninitiative der Technischen Universität München",
      organizerName,
      participantName: details.participantName,
      statement: createGermanCertificateText({ ...details, courseName, organizerName }),
      subtitle: "Abschlusszertifikat",
      title: "Zertifikat",
    };
  }

  return {
    courseName,
    description:
      "During the course, the participant explored AI tools, shaped prompts, compared results critically, created digital media, and prepared personal web, game, debate, and presentation outcomes with the support of AI.",
    footerLeft: "Five-day course program",
    footerRight: "Student Initiative at Technical University of Munich",
    organizerName,
    participantName: details.participantName,
    statement: createEnglishCertificateText({ ...details, courseName, organizerName }),
    subtitle: "Certificate of Completion",
    title: "Certificate",
  };
}

function normalizeFilenameText(value: string): string {
  return value
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("Ä", "Ae")
    .replaceAll("Ö", "Oe")
    .replaceAll("Ü", "Ue")
    .replaceAll("ß", "ss")
    .replace(/[^\x20-\x7e]/g, "");
}

const PDF_CHARACTER_ESCAPES: Record<string, string> = {
  "(": "\\(",
  ")": "\\)",
  "\\": "\\\\",
  Ä: "\\304",
  Ö: "\\326",
  Ü: "\\334",
  ß: "\\337",
  ä: "\\344",
  ö: "\\366",
  ü: "\\374",
};

function escapePdfString(value: string): string {
  return value
    .replace(/[\\()ÄÖÜßäöü]/g, (char) => PDF_CHARACTER_ESCAPES[char] ?? "")
    .replace(/[^\x20-\x7e]/g, "");
}

function measureText(text: string): string {
  return text
    .replace(/[ÄÖÜ]/g, "A")
    .replace(/[äöü]/g, "a")
    .replaceAll("ß", "ss")
    .replace(/[^\x20-\x7e]/g, "");
}

function estimateTextWidth(text: string, size: number) {
  return measureText(text).length * size * 0.48;
}

function centerX(text: string, size: number, pageWidth = 842) {
  return Math.max(48, (pageWidth - estimateTextWidth(text, size)) / 2);
}

function drawText(text: string, x: number, y: number, size: number, font = "F1") {
  return `BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${escapePdfString(text)}) Tj ET\n`;
}

function drawCenteredText(text: string, y: number, size: number, font = "F1") {
  return drawText(text, centerX(text, size), y, size, font);
}

function wrapText(text: string, maxChars: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (measureText(next).length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function lineLength(line: string) {
  return measureText(line).length;
}

function wrapBalancedText(text: string, maxChars: number) {
  const words = text.trim().split(/\s+/);
  const totalLength = lineLength(text);
  const targetLineCount = Math.max(1, Math.ceil(totalLength / maxChars));

  if (targetLineCount === 1 || words.length <= 2) {
    return wrapText(text, maxChars);
  }

  const targetLength = Math.ceil(totalLength / targetLineCount);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    const remainingLines = targetLineCount - lines.length - 1;
    const shouldBreak =
      current &&
      lines.length < targetLineCount - 1 &&
      lineLength(next) > targetLength &&
      words.length - lines.length > remainingLines;

    if (shouldBreak) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.flatMap((line) => wrapText(line, maxChars));
}

function createCertificateContentStream(content: CertificateContent) {
  const statementLines = wrapBalancedText(content.statement, 68);
  const descriptionLines = wrapBalancedText(content.description, 74);
  const leftFooterLines = wrapText(content.footerLeft, 36);
  const rightFooterLines = wrapText(content.footerRight, 42);
  let stream = "";

  stream += "0.97 0.95 1 rg 0 0 842 595 re f\n";
  stream += "0.10 0.00 0.29 RG 1.8 w 40 40 762 515 re S\n";
  stream += "0.60 0.39 0.85 RG 0.8 w 58 58 726 479 re S\n";
  stream += "0.10 0.00 0.29 rg 370 506 102 34 re f\n";
  stream += "1 1 1 rg\n";
  stream += drawCenteredText("TUM.ai", 517, 16, "F2");
  stream += "0.32 0.21 0.45 rg\n";
  stream += drawCenteredText(content.subtitle.toUpperCase(), 466, 15, "F2");
  stream += "0.10 0.00 0.29 rg\n";
  stream += drawCenteredText(content.participantName, 386, 54, "F2");
  stream += "0.27 0.26 0.32 rg\n";
  statementLines.forEach((line, index) => {
    stream += drawCenteredText(line, 332 - index * 21, 17);
  });

  const descriptionStartY = 270 - Math.max(0, statementLines.length - 1) * 8;
  descriptionLines.forEach((line, index) => {
    stream += drawCenteredText(line, descriptionStartY - index * 18, 13);
  });

  stream += "0.10 0.00 0.29 rg\n";
  stream += "0.82 0.78 0.90 RG 0.8 w 82 124 678 0 l S\n";
  stream += drawText(content.courseName, 82, 82, 13, "F2");
  leftFooterLines.forEach((line, index) => {
    stream += drawText(line, 82, 64 - index * 14, 11);
  });
  stream += drawText(content.organizerName, 518, 82, 13, "F2");
  rightFooterLines.forEach((line, index) => {
    stream += drawText(line, 518, 64 - index * 14, 11);
  });

  return stream;
}

export function createCertificatePdf(details: CertificateDetails): Uint8Array {
  const content = createCertificateContent(details);
  const stream = createCertificateContentStream(content);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
}

function formatPdfNumber(value: number) {
  return value.toFixed(2);
}

function assertPositiveNumber(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
}

function concatByteChunks(chunks: Uint8Array[], totalLength: number) {
  const output = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });

  return output;
}

export function createCertificateImagePdf({
  imageBytes,
  imageHeight,
  imageWidth,
  pageHeight,
  pageWidth,
}: CertificateImagePdfInput): Uint8Array {
  assertPositiveNumber(imageBytes.byteLength, "imageBytes.byteLength");
  assertPositiveNumber(imageHeight, "imageHeight");
  assertPositiveNumber(imageWidth, "imageWidth");
  assertPositiveNumber(pageHeight, "pageHeight");
  assertPositiveNumber(pageWidth, "pageWidth");

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let length = 0;

  function addString(value: string) {
    const bytes = encoder.encode(value);
    chunks.push(bytes);
    length += bytes.byteLength;
  }

  function addBytes(bytes: Uint8Array) {
    chunks.push(bytes);
    length += bytes.byteLength;
  }

  function beginObject(objectNumber: number) {
    offsets[objectNumber] = length;
    addString(`${objectNumber} 0 obj\n`);
  }

  const contentStream = `q\n${formatPdfNumber(pageWidth)} 0 0 ${formatPdfNumber(pageHeight)} 0 0 cm\n/Im1 Do\nQ\n`;

  addString("%PDF-1.4\n");

  beginObject(1);
  addString("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  beginObject(2);
  addString("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  beginObject(3);
  addString(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatPdfNumber(pageWidth)} ${formatPdfNumber(
      pageHeight,
    )}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
  );

  beginObject(4);
  addString(
    `<< /Type /XObject /Subtype /Image /Width ${Math.round(imageWidth)} /Height ${Math.round(
      imageHeight,
    )} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.byteLength} >>\nstream\n`,
  );
  addBytes(imageBytes);
  addString("\nendstream\nendobj\n");

  beginObject(5);
  addString(`<< /Length ${encoder.encode(contentStream).byteLength} >>\nstream\n${contentStream}endstream\nendobj\n`);

  const xrefOffset = length;
  addString("xref\n0 6\n");
  addString("0000000000 65535 f \n");
  for (let objectNumber = 1; objectNumber <= 5; objectNumber += 1) {
    addString(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`);
  }
  addString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return concatByteChunks(chunks, length);
}

export function createCertificateFilename(participantName: string, language: CertificateLanguage) {
  const safeName = normalizeFilenameText(participantName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `ai-edutainment-certificate-${safeName || "participant"}-${language}.pdf`;
}
