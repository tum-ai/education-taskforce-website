import { DAY_NUMBERS, type DayNumber } from "@/lib/domain/types";

export const COURSE_MATERIAL_AGE_GROUPS = ["younger", "older"] as const;
export type CourseMaterialAgeGroup = (typeof COURSE_MATERIAL_AGE_GROUPS)[number];

export type CourseNote = {
  dayNumber: DayNumber;
  ageGroup: CourseMaterialAgeGroup;
  markdown: string;
  updatedAt: string | null;
};

export type CourseNoteSaveInput = {
  dayNumber: DayNumber;
  ageGroup: CourseMaterialAgeGroup;
  markdown: string;
};

export function isCourseMaterialAgeGroup(value: unknown): value is CourseMaterialAgeGroup {
  return typeof value === "string" && COURSE_MATERIAL_AGE_GROUPS.includes(value as CourseMaterialAgeGroup);
}

export function isValidCourseMaterialDay(value: unknown): value is DayNumber {
  return typeof value === "number" && DAY_NUMBERS.includes(value as DayNumber);
}
