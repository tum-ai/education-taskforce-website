import { DAY_NUMBERS, type DayBucket, type DayNumber, type DayUpload } from "@/lib/domain/types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/translations";

const PROGRAM_DAYS_BY_LOCALE: Record<Locale, Array<Pick<DayBucket, "dayNumber" | "title" | "description">>> = {
  en: [
    {
      dayNumber: 1,
      title: "Discover AI",
      description: "Students explore what AI can and cannot do, then try their first small experiments.",
    },
    {
      dayNumber: 2,
      title: "Prompting And Ideas",
      description: "They learn how to shape prompts, compare results, and turn rough ideas into clearer plans.",
    },
    {
      dayNumber: 3,
      title: "Build With Images And Stories",
      description: "They create visual concepts, characters, and short story pieces with AI as a creative partner.",
    },
    {
      dayNumber: 4,
      title: "Create A Small Web Project",
      description: "They combine images, text, and simple code into a small interactive browser project.",
    },
    {
      dayNumber: 5,
      title: "Present And Share",
      description: "They polish their outcomes and present a final project they can revisit in the portal.",
    },
  ],
  de: [
    {
      dayNumber: 1,
      title: "KI entdecken",
      description: "Die Teilnehmenden erkunden, was KI kann und was nicht, und starten erste kleine Experimente.",
    },
    {
      dayNumber: 2,
      title: "Prompts und Ideen",
      description: "Sie lernen, Prompts zu formen, Ergebnisse zu vergleichen und grobe Ideen klarer zu planen.",
    },
    {
      dayNumber: 3,
      title: "Bilder und Geschichten bauen",
      description: "Sie entwickeln visuelle Konzepte, Figuren und kurze Story-Elemente mit KI als Kreativpartner.",
    },
    {
      dayNumber: 4,
      title: "Ein kleines Webprojekt erstellen",
      description: "Sie verbinden Bilder, Text und einfachen Code zu einem kleinen interaktiven Browserprojekt.",
    },
    {
      dayNumber: 5,
      title: "Präsentieren und teilen",
      description: "Sie überarbeiten ihre Ergebnisse und präsentieren ein finales Projekt, das im Portal bleibt.",
    },
  ],
};

export const PROGRAM_DAYS = PROGRAM_DAYS_BY_LOCALE[DEFAULT_LOCALE];

export function getProgramDays(locale: Locale = DEFAULT_LOCALE) {
  return PROGRAM_DAYS_BY_LOCALE[locale];
}

export function isDayNumber(value: unknown): value is DayNumber {
  return typeof value === "number" && DAY_NUMBERS.includes(value as DayNumber);
}

export function parseDayNumber(value: string | number): DayNumber | null {
  const numberValue = typeof value === "number" ? value : Number.parseInt(value, 10);
  return isDayNumber(numberValue) ? numberValue : null;
}

export function createDayBuckets(uploads: DayUpload[], locale: Locale = DEFAULT_LOCALE): DayBucket[] {
  return getProgramDays(locale).map((day) => ({
    ...day,
    uploads: uploads
      .filter((upload) => upload.dayNumber === day.dayNumber)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }));
}
