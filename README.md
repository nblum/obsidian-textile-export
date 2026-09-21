# Textile Export

[![CI](https://github.com/nblum/obsidian-textile-export/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/nblum/obsidian-textile-export/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/nblum/obsidian-textile-export?label=release)](https://github.com/nblum/obsidian-textile-export/releases)
[![License: MIT](https://img.shields.io/github/license/nblum/obsidian-textile-export)](LICENSE)
[![Star on GitHub](https://img.shields.io/github/stars/nblum/obsidian-textile-export?logo=github&label=star)](https://github.com/nblum/obsidian-textile-export)

Adds **Export to Textile** to the file context menu (file explorer and the note's "More options" menu). It converts
the note's Markdown to Textile markup and copies the result to the clipboard, ready to paste into a
Textile-capable issue or wiki field.

## Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Supported conversions](#supported-conversions)
- [Limitations](#limitations)
- [Settings](#settings)
- [Installation](#installation)
- [Feedback and support](#feedback-and-support)
- [Development](#development)
- [Releases](#releases)

## Features

- exports any Markdown note from the file context menu with one click
- converts headings, emphasis, lists, tables, images, links, blockquotes, and code blocks to Textile
- handles nested and mixed ordered/unordered lists with tab or space indentation
- strips YAML frontmatter before conversion
- runs entirely locally; the note is only copied to the clipboard
- provides a German and English interface with automatic Obsidian-language detection

## Quick start

1. Enable **Textile Export** under **Settings → Community plugins**.
2. Right-click a Markdown note in the file explorer, or open its **More options** menu.
3. Select **Export to Textile**.
4. Paste the clipboard content into any Textile-capable issue or wiki field.

## Supported conversions

| Markdown | Textile |
| --- | --- |
| `# Heading` … `###### Heading` | `h1.` … `h6.` |
| `**bold**`, `__bold__` | `*bold*` |
| `*italic*`, `_italic_` | `_italic_` |
| `***both***`, `___both___` | `_*both*_` |
| `~~strike~~` | `-strike-` |
| `` `code` `` | `@code@` |
| Fenced code blocks (```` ``` ```` or `~~~`) | `<pre>…</pre>`, or `<pre><code class="lang">…</code></pre>` with a language |
| `[text](url)` | `"text":url` |
| `![alt](url)` | `!url(alt)!` (`!url!` without alt text) |
| `![alt\|300](url)`, `![[file.png\|300]]` | `!{width:300px}url(alt)!` (`300x200` also sets the height) |
| `[[Note]]`, `[[Note\|Alias]]` | plain text (`Note`, `Alias`) |
| `-`, `*`, `+` list items | `*`, `**`, … by nesting depth |
| `1.` list items | `#`, `##`, … by nesting depth |
| Ordered inside unordered and vice versa | `*#`, `#*`, … |
| `> quote` | `bq. quote` |
| Tables | `\|_. header \|` and `\| cell \|` rows |
| YAML frontmatter | removed |

Nesting depth follows the indentation relative to the parent item, so tabs and two, three, or four spaces per level
all work.

## Limitations

This is a best-effort, line-based converter (not a full Markdown AST), so unusual Markdown may not translate
perfectly. In particular:

- Obsidian wikilinks lose their target because Textile has no equivalent.
- Redmine thumbnail macros drop alt text and folder paths; they only work for images attached to the Redmine page or issue.
- Image titles (`![alt](url "title")`) and table column alignment (`:---:`) are not converted.
- Content inside code blocks and inline code is never interpreted as markup.

## Settings

| Setting | Default | Effect |
| --- | --- | --- |
| Language | Automatic | Uses German for German Obsidian locales and English otherwise; both can be selected explicitly. |
| Export images as Redmine thumbnails | Off | Writes local images as `{{thumbnail(file.png)}}` (with `size=` when a width is given) instead of Textile `!file.png!`. Redmine only resolves attached files, so images with a URL stay regular Textile images. |

The **About me** section at the top of the settings links to the developer website, the GitHub repository for stars,
and the issue page for feedback.

## Installation

Textile Export requires Obsidian `1.8.7` or later and works on desktop and mobile.

Download `main.js` and `manifest.json` from the [latest release](https://github.com/nblum/obsidian-textile-export/releases),
place them in `.obsidian/plugins/textile-export/` inside your vault, then reload Obsidian and enable
**Textile Export**.

For local development, place this repository at `.obsidian/plugins/textile-export/`, install dependencies, and build
the bundle:

```bash
npm install
npm run build
```

## Feedback and support

- [Report a bug or request a feature](https://github.com/nblum/obsidian-textile-export/issues/new)
- [View releases](https://github.com/nblum/obsidian-textile-export/releases)
- [Read the changelog](CHANGELOG.md)
- [Visit the developer website](https://blum-nico.de)

If Textile Export is useful to you, a [GitHub star](https://github.com/nblum/obsidian-textile-export) is much
appreciated.

## Development

```bash
npm install
npm run dev
npm run validate:manifest
npm run typecheck
npm run lint
npm test
npm run build
```

Source modules live in `src/`, translations in `locales/`, deterministic unit tests in `tests/`, and release
automation in `.github/workflows/`. Converter tests also run on fixture pairs in `tests/fixtures/`: each `<name>.md`
is converted and compared with `<name>.textile`. To add a case, drop in both files. The generated `main.js`,
installed dependencies, IDE metadata, and local `data.json` settings are ignored by Git.

See [FEATURES.md](FEATURES.md) for the authoritative feature scope and [CONTRIBUTING.md](CONTRIBUTING.md) for the
development checklist.

## Releases

Add notes below `## [Unreleased]` in `CHANGELOG.md`, commit and synchronize all pending work, then run
`npm run release -- <x.y.z>`. The task synchronizes release metadata, runs all checks, commits, tags, and atomically
pushes the branch and tag. The tag workflow builds and publishes `main.js` and `manifest.json` with artifact
attestations. Publishing starts only after linting, tests, and production builds pass on Linux, macOS, and Windows.
