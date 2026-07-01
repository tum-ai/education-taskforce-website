export const DEFAULT_LOVABLE_LOGIN_URL = "https://lovable.dev/";

export type LovableCredentialInput = {
  label: string;
  email: string;
  password: string;
  group?: string;
  device?: string;
  loginUrl: string;
};

export type LovableImportError = {
  row: number;
  field: string;
  message: string;
};

export type LovableParseResult = {
  credentials: LovableCredentialInput[];
  errors: LovableImportError[];
};

export type LovableCredential = {
  id: string;
  label: string;
  email: string;
  password: string;
  group?: string;
  device?: string;
  loginUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type LovableCredentialCard = LovableCredential & {
  qrPayload: string;
  qrDataUrl: string;
};

const ALLOWED_HEADERS = ["label", "email", "password", "group", "device", "loginUrl"];
const REQUIRED_HEADERS = ["label", "email", "password"];

export function parseLovableCredentialsCsv(
  csv: string,
  options: { defaultLoginUrl?: string } = {},
): LovableParseResult {
  const errors: LovableImportError[] = [];
  const parsedRows = parseCsvRows(csv);
  const defaultLoginUrl = normalizeLovableLoginUrl(options.defaultLoginUrl ?? DEFAULT_LOVABLE_LOGIN_URL);

  if (!defaultLoginUrl) {
    errors.push({ row: 1, field: "loginUrl", message: "Default Lovable URL must use http or https." });
  }

  if (parsedRows.length === 0) {
    return { credentials: [], errors: [{ row: 1, field: "csv", message: "CSV is empty." }] };
  }

  const headers = parsedRows[0].map((header) => header.trim());
  const headerSet = new Set(headers);

  for (const required of REQUIRED_HEADERS) {
    if (!headerSet.has(required)) {
      errors.push({ row: 1, field: required, message: `Missing required header: ${required}` });
    }
  }

  for (const header of headers) {
    if (header && !ALLOWED_HEADERS.includes(header)) {
      errors.push({ row: 1, field: header, message: `Unsupported header: ${header}` });
    }
  }

  if (errors.length > 0) {
    return { credentials: [], errors };
  }

  const credentials: LovableCredentialInput[] = [];
  const seenEmails = new Set<string>();

  parsedRows.slice(1).forEach((fields, index) => {
    const rowNumber = index + 2;
    if (fields.every((field) => field.trim() === "")) {
      return;
    }

    const raw = Object.fromEntries(headers.map((header, headerIndex) => [header, fields[headerIndex]?.trim() || ""]));
    const label = raw.label;
    const email = raw.email.toLowerCase();
    const password = raw.password;
    const loginUrl = raw.loginUrl ? normalizeLovableLoginUrl(raw.loginUrl) : defaultLoginUrl;

    if (!label) {
      errors.push({ row: rowNumber, field: "label", message: "Label is required." });
    }

    if (!isValidEmail(email)) {
      errors.push({ row: rowNumber, field: "email", message: "Email is invalid." });
    }

    if (!password) {
      errors.push({ row: rowNumber, field: "password", message: "Password is required." });
    }

    if (!loginUrl) {
      errors.push({ row: rowNumber, field: "loginUrl", message: "Lovable URL must use http or https." });
    }

    if (seenEmails.has(email)) {
      errors.push({ row: rowNumber, field: "email", message: `Duplicate email: ${email}` });
    }
    seenEmails.add(email);

    for (const [field, value] of Object.entries(raw)) {
      if (field !== "password" && isDangerousSpreadsheetValue(value)) {
        errors.push({ row: rowNumber, field, message: "Spreadsheet formula-like value is not allowed." });
      }
    }

    credentials.push({
      label,
      email,
      password,
      group: raw.group || undefined,
      device: raw.device || undefined,
      loginUrl: loginUrl || DEFAULT_LOVABLE_LOGIN_URL,
    });
  });

  if (credentials.length === 0 && errors.length === 0) {
    errors.push({ row: 2, field: "csv", message: "Add at least one credential row." });
  }

  return errors.length > 0 ? { credentials: [], errors } : { credentials, errors };
}

export function normalizeLovableLoginUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());

    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isDangerousSpreadsheetValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return /^[=+\-@]/.test(value.trim());
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}
