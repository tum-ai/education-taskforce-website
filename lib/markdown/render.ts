const HTML_ESCAPE_LOOKUP: Record<string, string> = {
  "&": "&amp;",
  '"': "&quot;",
  "'": "&#39;",
  "<": "&lt;",
  ">": "&gt;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&"'<>]/g, (char) => HTML_ESCAPE_LOOKUP[char]);
}

function isSafeUrl(value: string): boolean {
  return /^(https?:\/\/|mailto:|\/(?!\/))/i.test(value);
}

function renderInline(markdown: string): string {
  const codeSpans: string[] = [];
  let html = escapeHtml(markdown).replace(/`([^`]+)`/g, (_match, code: string) => {
    const token = `@@CODE_SPAN_${codeSpans.length}@@`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });

  html = html.replace(/\[([^\]]+)]\(([^)\s]+)\)/g, (_match, label: string, href: string) => {
    const safeHref = escapeHtml(href);
    if (!isSafeUrl(href)) {
      return label;
    }

    return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">${label}</a>`;
  });

  html = html
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  codeSpans.forEach((codeSpan, index) => {
    html = html.replace(`@@CODE_SPAN_${index}@@`, codeSpan);
  });

  return html;
}

type RenderMarkdownOptions = {
  activeLine?: number;
};

function createBlockAttributes(startLine: number, endLine: number, options: RenderMarkdownOptions) {
  const activeLine = options.activeLine;
  const className = activeLine && activeLine >= startLine && activeLine <= endLine ? ' class="markdown-active-block"' : "";
  return ` data-source-line="${startLine}"${className}`;
}

export function renderMarkdownToHtml(markdown: string, options: RenderMarkdownOptions = {}): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];
  let paragraphStartLine: number | null = null;
  let paragraphEndLine: number | null = null;
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;
  let listStartLine: number | null = null;
  let listEndLine: number | null = null;
  let blockquote: string[] = [];
  let blockquoteStartLine: number | null = null;
  let blockquoteEndLine: number | null = null;
  let codeFence: { lines: string[]; startLine: number; endLine: number } | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }
    output.push(
      `<p${createBlockAttributes(paragraphStartLine ?? 1, paragraphEndLine ?? paragraphStartLine ?? 1, options)}>${renderInline(paragraph.join(" "))}</p>`,
    );
    paragraph = [];
    paragraphStartLine = null;
    paragraphEndLine = null;
  }

  function flushList() {
    if (!listType || listItems.length === 0) {
      return;
    }
    output.push(
      `<${listType}${createBlockAttributes(listStartLine ?? 1, listEndLine ?? listStartLine ?? 1, options)}>${listItems
        .map((item) => `<li>${renderInline(item)}</li>`)
        .join("")}</${listType}>`,
    );
    listType = null;
    listItems = [];
    listStartLine = null;
    listEndLine = null;
  }

  function flushBlockquote() {
    if (blockquote.length === 0) {
      return;
    }
    output.push(
      `<blockquote${createBlockAttributes(blockquoteStartLine ?? 1, blockquoteEndLine ?? blockquoteStartLine ?? 1, options)}><p>${renderInline(
        blockquote.join(" "),
      )}</p></blockquote>`,
    );
    blockquote = [];
    blockquoteStartLine = null;
    blockquoteEndLine = null;
  }

  function flushOpenBlocks() {
    flushParagraph();
    flushList();
    flushBlockquote();
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (codeFence) {
      if (trimmed.startsWith("```")) {
        codeFence.endLine = lineNumber;
        output.push(
          `<pre${createBlockAttributes(codeFence.startLine, codeFence.endLine, options)}><code>${escapeHtml(
            codeFence.lines.join("\n"),
          )}</code></pre>`,
        );
        codeFence = null;
      } else {
        codeFence.lines.push(line);
        codeFence.endLine = lineNumber;
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushOpenBlocks();
      codeFence = { endLine: lineNumber, lines: [], startLine: lineNumber };
      continue;
    }

    if (trimmed.length === 0) {
      flushOpenBlocks();
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushOpenBlocks();
      const level = headingMatch[1].length;
      output.push(`<h${level}${createBlockAttributes(lineNumber, lineNumber, options)}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushOpenBlocks();
      output.push(`<hr${createBlockAttributes(lineNumber, lineNumber, options)}>`);
      continue;
    }

    const unorderedMatch = /^[-*+]\s+(.+)$/.exec(trimmed);
    const orderedMatch = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (unorderedMatch || orderedMatch) {
      flushParagraph();
      flushBlockquote();
      const nextType = orderedMatch ? "ol" : "ul";
      if (listType && listType !== nextType) {
        flushList();
      }
      listType = nextType;
      listStartLine ??= lineNumber;
      listEndLine = lineNumber;
      listItems.push((unorderedMatch ?? orderedMatch)?.[1] ?? "");
      continue;
    }

    const quoteMatch = /^>\s?(.+)$/.exec(trimmed);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      blockquoteStartLine ??= lineNumber;
      blockquoteEndLine = lineNumber;
      blockquote.push(quoteMatch[1]);
      continue;
    }

    flushList();
    flushBlockquote();
    paragraphStartLine ??= lineNumber;
    paragraphEndLine = lineNumber;
    paragraph.push(trimmed);
  }

  if (codeFence) {
    output.push(
      `<pre${createBlockAttributes(codeFence.startLine, codeFence.endLine, options)}><code>${escapeHtml(
        codeFence.lines.join("\n"),
      )}</code></pre>`,
    );
  }
  flushOpenBlocks();

  return output.join("\n");
}
