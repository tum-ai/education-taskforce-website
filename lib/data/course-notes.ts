import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DAY_NUMBERS, type DayNumber } from "@/lib/domain/types";
import {
  COURSE_MATERIAL_AGE_GROUPS,
  type CourseMaterialAgeGroup,
  type CourseNote,
  type CourseNoteSaveInput,
} from "@/lib/domain/course-material";

type CourseNoteRow = {
  day_number: DayNumber;
  age_group: CourseMaterialAgeGroup;
  markdown: string;
  updated_at: string | null;
};

function mapCourseNote(row: CourseNoteRow): CourseNote {
  return {
    ageGroup: row.age_group,
    dayNumber: row.day_number,
    markdown: row.markdown,
    updatedAt: row.updated_at,
  };
}

function createDefaultNote(dayNumber: DayNumber, ageGroup: CourseMaterialAgeGroup): CourseNote {
  const ageLabel = ageGroup === "younger" ? "8-11" : "12-18";
  return {
    ageGroup,
    dayNumber,
    markdown: `# Day ${dayNumber} notes for ages ${ageLabel}

## Goals

- 

## Materials

- 

## Flow

1. 

## Notes

`,
    updatedAt: null,
  };
}

export async function listCourseNotes(): Promise<CourseNote[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("course_notes")
    .select("day_number, age_group, markdown, updated_at")
    .order("day_number", { ascending: true })
    .order("age_group", { ascending: true });

  if (error) {
    throw new Error("Could not load course notes.");
  }

  const existing = new Map<string, CourseNote>();
  (data ?? []).forEach((row) => {
    const note = mapCourseNote(row as CourseNoteRow);
    existing.set(`${note.dayNumber}:${note.ageGroup}`, note);
  });

  return DAY_NUMBERS.flatMap((dayNumber) =>
    COURSE_MATERIAL_AGE_GROUPS.map((ageGroup) => existing.get(`${dayNumber}:${ageGroup}`) ?? createDefaultNote(dayNumber, ageGroup)),
  );
}

export async function upsertCourseNote(input: CourseNoteSaveInput, updatedBy: string): Promise<CourseNote> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("course_notes")
    .upsert(
      {
        age_group: input.ageGroup,
        day_number: input.dayNumber,
        markdown: input.markdown,
        updated_by: updatedBy,
      },
      { onConflict: "day_number,age_group" },
    )
    .select("day_number, age_group, markdown, updated_at")
    .single();

  if (error || !data) {
    throw new Error("Could not save course note.");
  }

  return mapCourseNote(data as CourseNoteRow);
}
