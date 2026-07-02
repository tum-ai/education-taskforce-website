"use client";

import { Save } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  COURSE_MATERIAL_AGE_GROUPS,
  type CourseMaterialAgeGroup,
  type CourseNote,
  type CourseNoteSaveInput,
} from "@/lib/domain/course-material";
import { DAY_NUMBERS, type DayNumber } from "@/lib/domain/types";
import { translate, type Locale } from "@/lib/i18n/translations";
import { renderMarkdownToHtml } from "@/lib/markdown/render";
import styles from "./CourseMaterialEditor.module.css";

type CourseMaterialSaveResult =
  | {
      note: CourseNote;
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

type CourseMaterialEditorProps = {
  locale: Locale;
  notes: CourseNote[];
  saveNote: (input: CourseNoteSaveInput & { locale?: Locale }) => Promise<CourseMaterialSaveResult>;
};

function noteKey(dayNumber: DayNumber, ageGroup: CourseMaterialAgeGroup) {
  return `${dayNumber}:${ageGroup}`;
}

function createDefaultMarkdown(dayNumber: DayNumber, ageGroup: CourseMaterialAgeGroup) {
  const ageLabel = ageGroup === "younger" ? "8-11" : "12-18";
  return `# Day ${dayNumber} notes for ages ${ageLabel}

## Goals

- 

## Materials

- 

## Flow

1. 

## Notes

`;
}

function formatSavedAt(value: string | null, locale: Locale) {
  if (!value) {
    return translate(locale, "admin.courseMaterialNotSaved");
  }

  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ageGroupLabel(ageGroup: CourseMaterialAgeGroup, locale: Locale) {
  return ageGroup === "younger"
    ? translate(locale, "admin.courseMaterialAge.younger")
    : translate(locale, "admin.courseMaterialAge.older");
}

function normalizeNotes(notes: CourseNote[]) {
  const map = new Map<string, CourseNote>();
  notes.forEach((note) => {
    map.set(noteKey(note.dayNumber, note.ageGroup), note);
  });
  DAY_NUMBERS.forEach((dayNumber) => {
    COURSE_MATERIAL_AGE_GROUPS.forEach((ageGroup) => {
      const key = noteKey(dayNumber, ageGroup);
      if (!map.has(key)) {
        map.set(key, {
          ageGroup,
          dayNumber,
          markdown: createDefaultMarkdown(dayNumber, ageGroup),
          updatedAt: null,
        });
      }
    });
  });
  return map;
}

function getLineNumberForCursor(markdown: string, cursorPosition: number) {
  return markdown.slice(0, cursorPosition).split("\n").length;
}

export function CourseMaterialEditor({ locale, notes, saveNote }: CourseMaterialEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [selectedDay, setSelectedDay] = useState<DayNumber>(1);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<CourseMaterialAgeGroup>("younger");
  const [noteMap, setNoteMap] = useState(() => normalizeNotes(notes));
  const [drafts, setDrafts] = useState(() => {
    const initialDrafts = new Map<string, string>();
    normalizeNotes(notes).forEach((note, key) => initialDrafts.set(key, note.markdown));
    return initialDrafts;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState(1);

  const selectedKey = noteKey(selectedDay, selectedAgeGroup);
  const selectedNote = noteMap.get(selectedKey);
  const markdown = drafts.get(selectedKey) ?? selectedNote?.markdown ?? createDefaultMarkdown(selectedDay, selectedAgeGroup);
  const deferredMarkdown = useDeferredValue(markdown);
  const previewHtml = useMemo(() => renderMarkdownToHtml(deferredMarkdown, { activeLine }), [activeLine, deferredMarkdown]);
  const hasUnsavedChanges = markdown !== selectedNote?.markdown;

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    editor.style.height = "auto";
    editor.style.height = `${Math.max(editor.scrollHeight, 560)}px`;
  }, [markdown, selectedKey]);

  function updateActiveLineFromEditor(editor: HTMLTextAreaElement) {
    setActiveLine(getLineNumberForCursor(editor.value, editor.selectionStart));
  }

  async function handleSave() {
    setIsSaving(true);
    setStatus(null);
    const result = await saveNote({
      ageGroup: selectedAgeGroup,
      dayNumber: selectedDay,
      locale,
      markdown,
    });
    setIsSaving(false);
    setStatus(result.message);

    if (result.status === "success") {
      const savedKey = noteKey(result.note.dayNumber, result.note.ageGroup);
      setNoteMap((current) => new Map(current).set(savedKey, result.note));
      setDrafts((current) => new Map(current).set(savedKey, result.note.markdown));
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.toolbar}>
        <div className={styles.group} aria-label={translate(locale, "admin.courseMaterialDaySelector")}>
          {DAY_NUMBERS.map((dayNumber) => (
            <button
              aria-pressed={selectedDay === dayNumber}
              className={selectedDay === dayNumber ? styles.active : ""}
              key={dayNumber}
              onClick={() => {
                setSelectedDay(dayNumber);
                setActiveLine(1);
                setStatus(null);
              }}
              type="button"
            >
              {translate(locale, "portal.day", { dayNumber })}
            </button>
          ))}
        </div>
        <div className={styles.group} aria-label={translate(locale, "admin.courseMaterialAgeSelector")}>
          {COURSE_MATERIAL_AGE_GROUPS.map((ageGroup) => (
            <button
              aria-pressed={selectedAgeGroup === ageGroup}
              className={selectedAgeGroup === ageGroup ? styles.active : ""}
              key={ageGroup}
              onClick={() => {
                setSelectedAgeGroup(ageGroup);
                setActiveLine(1);
                setStatus(null);
              }}
              type="button"
            >
              {ageGroupLabel(ageGroup, locale)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.metaBar}>
        <span>
          {translate(locale, "admin.courseMaterialLastSaved")}: {formatSavedAt(selectedNote?.updatedAt ?? null, locale)}
        </span>
        {hasUnsavedChanges ? <strong>{translate(locale, "admin.courseMaterialUnsaved")}</strong> : null}
      </div>
      <div className={styles.workspace}>
        <section className={styles.panel} aria-labelledby="course-material-markdown">
          <div className={styles.panelHeader}>
            <h2 id="course-material-markdown">{translate(locale, "admin.courseMaterialMarkdown")}</h2>
          </div>
          <textarea
            aria-label={translate(locale, "admin.courseMaterialMarkdown")}
            className={styles.editor}
            onClick={(event) => updateActiveLineFromEditor(event.currentTarget)}
            onChange={(event) => {
              const nextValue = event.target.value;
              setDrafts((current) => new Map(current).set(selectedKey, nextValue));
              setActiveLine(getLineNumberForCursor(nextValue, event.target.selectionStart));
            }}
            onKeyUp={(event) => updateActiveLineFromEditor(event.currentTarget)}
            onSelect={(event) => updateActiveLineFromEditor(event.currentTarget)}
            ref={editorRef}
            spellCheck={false}
            value={markdown}
          />
        </section>
        <section className={styles.panel} aria-labelledby="course-material-preview">
          <div className={styles.panelHeader}>
            <h2 id="course-material-preview">{translate(locale, "admin.courseMaterialPreview")}</h2>
          </div>
          <div className={styles.preview} dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </section>
      </div>
      <div className={styles.actions}>
        <Button disabled={isSaving || !hasUnsavedChanges} icon={<Save aria-hidden="true" size={18} />} onClick={handleSave}>
          {isSaving ? translate(locale, "admin.courseMaterialSaving") : translate(locale, "admin.courseMaterialSave")}
        </Button>
        {status ? <span className={styles.status}>{status}</span> : null}
      </div>
    </div>
  );
}
