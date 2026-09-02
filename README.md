# Redmine Export

Adds **Export to Redmine** to the file context menu (file explorer and the note's "More options" menu). It converts the note's Markdown to Redmine wiki (Textile) markup and copies the result to the clipboard, ready to paste into a Redmine issue or wiki page.

## Supported conversions

- Headings (`#` … `######` → `h1.` … `h6.`)
- Bold, italic, and combined bold+italic (`**`, `__`, `*`, `_`, `***`)
- Strikethrough (`~~text~~` → `-text-`)
- Inline code (`` `code` `` → `@code@`) and fenced code blocks (``` ``` ``` → `<pre><code class="lang">…</code></pre>`)
- Links (`[text](url)` → `"text":url`) and images (`![alt](url)` → `!url(alt)!`)
- Obsidian wikilinks (`[[Note]]`, `[[Note|Alias]]`) → plain text, since there is no cross-system target
- Unordered/ordered lists, including nesting (`*`/`**`/… and `#`/`##`/…)
- Blockquotes (`bq.`)
- Tables (Textile `|_. header |` / `| cell |` syntax)
- YAML frontmatter is stripped before conversion

This is a best-effort, line-based converter (not a full Markdown AST), so unusual or deeply nested Markdown may not translate perfectly.

## Development

```bash
npm install
npm run dev      # watch build
npm run build    # typecheck + production build
npm test         # node:test
npm run lint      # eslint
```
