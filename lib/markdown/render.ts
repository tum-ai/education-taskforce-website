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

export function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;
  let blockquote: string[] = [];
  let codeFence: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!listType || listItems.length === 0) {
      return;
    }
    output.push(`<${listType}>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${listType}>`);
    listType = null;
    listItems = [];
  }

  function flushBlockquote() {
    if (blockquote.length === 0) {
      return;
    }
    output.push(`<blockquote><p>${renderInline(blockquote.join(" "))}</p></blockquote>`);
    blockquote = [];
  }

  function flushOpenBlocks() {
    flushParagraph();
    flushList();
    flushBlockquote();
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (codeFence) {
      if (trimmed.startsWith("```")) {
        output.push(`<pre><code>${escapeHtml(codeFence.join("\n"))}</code></pre>`);
        codeFence = null;
      } else {
        codeFence.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushOpenBlocks();
      codeFence = [];
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
      output.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushOpenBlocks();
      output.push("<hr>");
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
      listItems.push((unorderedMatch ?? orderedMatch)?.[1] ?? "");
      continue;
    }

    const quoteMatch = /^>\s?(.+)$/.exec(trimmed);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      blockquote.push(quoteMatch[1]);
      continue;
    }

    flushList();
    flushBlockquote();
    paragraph.push(trimmed);
  }

  if (codeFence) {
    output.push(`<pre><code>${escapeHtml(codeFence.join("\n"))}</code></pre>`);
  }
  flushOpenBlocks();

  return output.join("\n");
}
