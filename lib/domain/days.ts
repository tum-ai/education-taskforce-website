import { DAY_NUMBERS, type DayBucket, type DayNumber, type DayUpload } from "@/lib/domain/types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/translations";

const PROGRAM_DAYS_BY_LOCALE: Record<
  Locale,
  Array<Pick<DayBucket, "dayNumber" | "title" | "description" | "shortDescription">>
> = {
  en: [
    {
      dayNumber: 1,
      title: "Explore AI",
      description:
        "Students start by discovering what artificial intelligence can already do and where human ideas still matter most. They try playful experiments, compare surprising results, and learn how to talk to AI tools with confidence. The pace stays flexible, so curious students can go deeper while beginners get the support they need. Everyone leaves day one with a clearer feeling for AI and a first spark of creative momentum.",
      shortDescription:
        "A playful first step into AI tools, prompts, and surprising results. Students learn how to experiment with confidence and curiosity.",
    },
    {
      dayNumber: 2,
      title: "Hacking With AI",
      description:
        "Students learn how to use AI as a practical helper for solving problems, testing ideas, and understanding generated code. They experiment with prompts, inspect AI suggestions, and see how fast they can move when they ask better questions. The course adapts to each child's speed, so nobody gets pushed too far or held back. The goal is to make technical work feel exciting, approachable, and fun.",
      shortDescription:
        "Students guide AI to generate, inspect, and improve technical ideas. They learn how better questions lead to better results.",
    },
    {
      dayNumber: 3,
      title: "Debate AI & Build a Game",
      description:
        "Students debate what AI should and should not do, then turn that critical thinking into a hands-on video game project. They design mechanics, shape a small world, and guide AI-generated code while still making the creative decisions. Eager students can add more features, while others can focus on a polished simple version. By the end, the emphasis is on ownership, confidence, and the joy of building something playable.",
      shortDescription:
        "They debate responsible AI, then guide AI tools to create a small game. The focus stays on ideas, play, and creative decisions.",
    },
    {
      dayNumber: 4,
      title: "Build Your Own Website",
      description:
        "Students bring their ideas onto the web by combining text, images, layout, and AI-generated code into their own website. They learn how pages are structured, how design choices change the feeling of a project, and how AI can help without taking over. The work stays modular, so each child can build at the level that fits their confidence and curiosity. The result is a personal web project they can keep improving.",
      shortDescription:
        "They turn ideas into a personal website by steering AI-generated code, layout, images, and text. The result can keep growing.",
    },
    {
      dayNumber: 5,
      title: "Present What You Built",
      description:
        "Students polish their favorite outcomes and decide what they would like to share. If they are proud of a game, website, image, or story, we help them prepare a small showcase for their parents. They practice explaining what they learned, what they built, and where they want to go next. The final day celebrates progress, fun, and the confidence each child gained at their own pace.",
      shortDescription:
        "They polish a favorite outcome and can prepare a small showcase for parents. The day celebrates progress and confidence.",
    },
  ],
  de: [
    {
      dayNumber: 1,
      title: "KI entdecken",
      description:
        "Die Teilnehmenden entdecken, was künstliche Intelligenz heute schon kann und wo menschliche Ideen weiterhin entscheidend sind. Sie probieren spielerische Experimente aus, vergleichen überraschende Ergebnisse und lernen, sicher mit KI-Werkzeugen zu sprechen. Das Tempo bleibt flexibel, damit neugierige Kinder tiefer einsteigen können und Einsteiger die Unterstützung bekommen, die sie brauchen. Am Ende des ersten Tages haben alle ein besseres Gefühl für KI und erste kreative Erfolgserlebnisse.",
      shortDescription:
        "Ein spielerischer Einstieg in KI-Werkzeuge, Prompts und überraschende Ergebnisse. Die Kinder experimentieren mit Neugier und Sicherheit.",
    },
    {
      dayNumber: 2,
      title: "Hacking mit KI",
      description:
        "Die Teilnehmenden lernen, KI als praktischen Helfer zum Lösen von Problemen, Testen von Ideen und Verstehen von generiertem Code zu nutzen. Sie experimentieren mit Prompts, prüfen KI-Vorschläge und merken, wie viel schneller sie werden, wenn sie bessere Fragen stellen. Der Kurs passt sich dem Tempo jedes Kindes an, damit niemand überfordert wird und niemand ausgebremst bleibt. Technik soll sich hier spannend, zugänglich und vor allem nach Spaß anfühlen.",
      shortDescription:
        "Die Teilnehmenden steuern KI, um technische Ideen zu generieren, zu prüfen und zu verbessern. Bessere Fragen führen zu besseren Ergebnissen.",
    },
    {
      dayNumber: 3,
      title: "KI debattieren & Spiel bauen",
      description:
        "Die Teilnehmenden diskutieren, was KI tun sollte und was nicht, und verwandeln dieses kritische Denken anschließend in ein eigenes Videospielprojekt. Sie entwerfen Mechaniken, gestalten eine kleine Welt und steuern KI-generierten Code, ohne die kreativen Entscheidungen abzugeben. Wer besonders motiviert ist, kann zusätzliche Features ergänzen, während andere eine einfache, saubere Version fertigstellen. Am Ende stehen Eigenständigkeit, Vertrauen in die eigenen Fähigkeiten und die Freude am spielbaren Ergebnis im Mittelpunkt.",
      shortDescription:
        "Sie debattieren verantwortungsvolle KI und steuern KI-Werkzeuge, um ein kleines Spiel zu bauen. Im Mittelpunkt stehen Ideen und Spielspaß.",
    },
    {
      dayNumber: 4,
      title: "Die eigene Website bauen",
      description:
        "Die Teilnehmenden bringen ihre Ideen ins Web und verbinden Text, Bilder, Layout und KI-generierten Code zu einer eigenen Website. Sie lernen, wie Seiten aufgebaut sind, wie Designentscheidungen die Wirkung verändern und wie KI helfen kann, ohne die Kontrolle zu übernehmen. Die Aufgaben bleiben modular, damit jedes Kind auf dem Niveau arbeiten kann, das zu Selbstvertrauen und Neugier passt. Das Ergebnis ist ein persönliches Webprojekt, das weiter wachsen kann.",
      shortDescription:
        "Sie verwandeln Ideen in eine Website und steuern KI-generierten Code, Layout, Bilder und Text. Das Projekt kann weiter wachsen.",
    },
    {
      dayNumber: 5,
      title: "Zeigen, was entstanden ist",
      description:
        "Die Teilnehmenden verfeinern ihre liebsten Ergebnisse und entscheiden, was sie gerne zeigen möchten. Wenn sie stolz auf ein Spiel, eine Website, ein Bild oder eine Geschichte sind, helfen wir ihnen bei einer kleinen Präsentation für ihre Eltern. Sie üben zu erklären, was sie gelernt haben, was sie gebaut haben und worauf sie als Nächstes Lust haben. Der letzte Tag feiert Fortschritt, Spaß und das Selbstvertrauen, das jedes Kind im eigenen Tempo aufgebaut hat.",
      shortDescription:
        "Sie verfeinern ein Lieblingsprojekt und können eine kleine Präsentation für Eltern vorbereiten. Der Tag feiert Fortschritt und Selbstvertrauen.",
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
