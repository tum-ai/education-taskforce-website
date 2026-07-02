import { describe, expect, it } from "vitest";
import { renderMarkdownToHtml } from "@/lib/markdown/render";

describe("renderMarkdownToHtml", () => {
  it("renders common course-note markdown blocks", () => {
    const html = renderMarkdownToHtml(`# Day plan

- Warmup
- Group exercise

\`\`\`txt
prompt template
\`\`\``);

    expect(html).toContain('<h1 data-source-line="1">Day plan</h1>');
    expect(html).toContain("<li>Warmup</li>");
    expect(html).toContain("<li>Group exercise</li>");
    expect(html).toContain('<pre data-source-line="6"><code>prompt template</code></pre>');
  });

  it("escapes raw html instead of executing it", () => {
    const html = renderMarkdownToHtml(`<script>alert("x")</script>

**safe note**`);

    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("<strong>safe note</strong>");
    expect(html).not.toContain("<script>");
  });

  it("marks the rendered block for the active source line", () => {
    const html = renderMarkdownToHtml(`# Day plan

Intro paragraph

- Warmup
- Group exercise`, { activeLine: 5 });

    expect(html).toContain('<ul data-source-line="5" class="markdown-active-block">');
  });
});
