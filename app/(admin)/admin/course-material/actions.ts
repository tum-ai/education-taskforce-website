"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current-account";
import { upsertCourseNote } from "@/lib/data/course-notes";
import {
  isCourseMaterialAgeGroup,
  isValidCourseMaterialDay,
  type CourseNote,
  type CourseNoteSaveInput,
} from "@/lib/domain/course-material";
import { normalizeLocale, translate, type Locale } from "@/lib/i18n/translations";

type CourseMaterialSaveInput = CourseNoteSaveInput & {
  locale?: Locale;
};

export type CourseMaterialActionState =
  | {
      note: CourseNote;
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function saveCourseMaterialAction(input: CourseMaterialSaveInput): Promise<CourseMaterialActionState> {
  const account = await requireAdmin();
  const locale = normalizeLocale(input.locale);

  if (!isValidCourseMaterialDay(input.dayNumber) || !isCourseMaterialAgeGroup(input.ageGroup)) {
    return {
      status: "error",
      message: translate(locale, "admin.courseMaterialInvalidSelection"),
    };
  }

  if (input.markdown.length > 50000) {
    return {
      status: "error",
      message: translate(locale, "admin.courseMaterialTooLong"),
    };
  }

  try {
    const note = await upsertCourseNote(input, account.id);
    revalidatePath("/admin/course-material");
    return {
      note,
      status: "success",
      message: translate(locale, "admin.courseMaterialSaved"),
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : translate(locale, "admin.courseMaterialCouldNotSave"),
    };
  }
}
