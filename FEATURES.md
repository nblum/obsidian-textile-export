# Features and requirements

This document defines the implemented scope of **Textile Export** and the acceptance criteria for future changes.

## Goal

Textile Export turns an Obsidian note into Textile markup on the clipboard so it can be pasted into
a Textile-capable issue or wiki field without manual reformatting.

## Export action

- A **Export to Textile** entry is added to the file context menu for Markdown files only.
- The note is read through the vault cache and converted without modifying the file.
- The result is written to the clipboard and confirmed with a notice naming the note.
- A failed export shows a notice and logs the error to the console; it never changes the note.

## Conversion

- YAML frontmatter is removed and Windows line endings are normalized before conversion.
- Headings `#` to `######` become `h1.` to `h6.`.
- Bold (`**`, `__`), italic (`*`, `_`), and combined emphasis (`***`, `___`) become `*bold*`, `_italic_`, and
  `_*both*_`. A converted run is never re-interpreted as another emphasis.
- Strikethrough becomes `-text-`.
- Inline code becomes `@code@`; its contents are never interpreted as markup.
- Fenced code blocks (backticks or tildes) become `<pre>`, or `<pre><code class="language">` when a language is given.
  Their contents are copied unchanged.
- Links become `"text":url` and underscores inside URLs are preserved.
- Images become `!url(alt)!`, or `!url!` without alt text; image titles are dropped.
- Obsidian sizes (`![alt|300](url)`, `![alt|300x200](url)`) and image embeds (`![[file.png]]`, `![[file.png|300]]`,
  `![[file.png|alt|300]]`) become `!{width:300px}url(alt)!`; `300x200` also sets `height`. Embeds of non-image files
  are not converted. Inside table cells the pipe must be escaped (`![[file.png\|300]]`), as Obsidian requires.
- Obsidian wikilinks become their alias, or their target when there is no alias.
- Consecutive blockquote lines produce one `bq.` marker on the first line only.
- Tables with a separator row become Textile tables with a `_.` header row; outer pipes are optional and column
  alignment markers are accepted but not converted. Cells receive inline conversion.

## Lists

- `-`, `*`, and `+` items become `*`; `1.` items become `#`.
- Nesting depth is derived from the indentation relative to the parent item, not from an absolute width. A tab counts
  as four spaces; two, three, and four spaces per level all yield consecutive levels.
- Every ancestor contributes its own marker, so an ordered item inside an unordered item becomes `*#` and an
  unordered item inside an ordered item becomes `#*`.
- Blank lines keep a list open; any other non-list line ends it.
- List items receive inline conversion.

## Settings

- Invalid or missing persisted values fall back to documented defaults.
- The interface is available in German and English; automatic selection follows Obsidian and falls back to English.
- Users can override automatic language selection with an explicit German or English preference.
- **Export images as Redmine thumbnails** (default off): local images are written as `{{thumbnail(file.png)}}`, or
  `{{thumbnail(file.png, size=300)}}` when a width is given (the height is used if only a height exists). The macro uses
  the file name without folders and drops alt text. Images with a URL always stay Textile images.
- An **About me** section at the top of the settings links to the developer website, the GitHub repository, and the
  issue page for feedback.
- Obsidian 1.13 and newer render the settings declaratively; older versions use the legacy settings tab with the same
  controls.

## Technical requirements

- Obsidian `1.8.7` or later on desktop and mobile; the plugin uses no Node.js APIs.
- CI validates linting, tests, and production builds on Windows, macOS, and Linux.
- TypeScript strict mode with checked indexed access and exact optional properties.
- Deterministic unit tests must not require an Obsidian runtime.
- Converter behavior is covered by Markdown and Textile fixture pairs in `tests/fixtures/`.
- Release builds contain no runtime dependencies other than the Obsidian API.
- German and English translation tables expose identical keys and are embedded in the production bundle.

## Acceptance criteria

A behavior change is complete when:

1. the converter change has a fixture pair or focused unit test,
2. `npm run validate:manifest`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass,
3. user-visible behavior is reflected in README and this document,
4. new visible strings exist in both locale files with identical keys and placeholders,
5. `git diff --check` reports no whitespace errors.
