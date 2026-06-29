import { DAY_NUMBERS, type DayBucket, type DayNumber, type DayUpload } from "@/lib/domain/types";

export const PROGRAM_DAYS: Array<Pick<DayBucket, "dayNumber" | "title" | "description">> = [
  {
    dayNumber: 1,
    title: "Discover AI",
    description: "A gentle first look at how AI notices patterns, responds to prompts, and supports creative ideas.",
  },
  {
    dayNumber: 2,
    title: "Prompting And Ideas",
    description: "Families shape questions, compare answers, and learn how better prompts lead to better outcomes.",
  },
  {
    dayNumber: 3,
    title: "Build With Images And Stories",
    description: "Participants turn ideas into visuals, characters, and short narratives they can share.",
  },
  {
    dayNumber: 4,
    title: "Create A Small Web Project",
    description: "The group combines text, images, and simple code into a small browser project.",
  },
  {
    dayNumber: 5,
    title: "Present And Share",
    description: "Everyone gathers the week's outcomes and prepares a final showcase for the family.",
  },
];

export function isDayNumber(value: unknown): value is DayNumber {
  return typeof value === "number" && DAY_NUMBERS.includes(value as DayNumber);
}

export function parseDayNumber(value: string | number): DayNumber | null {
  const numberValue = typeof value === "number" ? value : Number.parseInt(value, 10);
  return isDayNumber(numberValue) ? numberValue : null;
}

export function createDayBuckets(uploads: DayUpload[]): DayBucket[] {
  return PROGRAM_DAYS.map((day) => ({
    ...day,
    uploads: uploads
      .filter((upload) => upload.dayNumber === day.dayNumber)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }));
}
