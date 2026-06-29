import { DAY_NUMBERS, type DayBucket, type DayNumber, type DayUpload } from "@/lib/domain/types";

export const PROGRAM_DAYS: Array<Pick<DayBucket, "dayNumber" | "title" | "description">> = [
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
