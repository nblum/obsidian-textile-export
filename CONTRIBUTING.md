# Contributing

Thanks for contributing to **Textile Export**. Keep changes focused: the plugin does one thing, converting a note to
Textile markup, and should stay small and predictable.

## Development environment

- Obsidian `1.8.7` or later for manual UI checks
- Node.js 22.6 or later for TypeScript execution through `node:test`
- npm for dependency installation and project scripts

Install dependencies once:

```bash
npm install
```

The repository should live at `.obsidian/plugins/textile-export/` in a test vault. After source changes, run
`npm run build`, then reload the plugin or Obsidian.

## Project layout

- `src/main.ts` – Obsidian entry point, file menu entry, and clipboard export
- `src/textile-converter.ts` – pure Markdown to Textile conversion
- `src/i18n.ts` – translation lookup and language resolution
- `src/settings.ts` – validated persistent setting model
- `src/settings-tab.ts` – Obsidian settings controls
- `locales/` – German and English translation tables
- `tests/` – deterministic TypeScript unit tests
- `tests/fixtures/` – `<name>.md` inputs with their expected `<name>.textile` output
- `scripts/validate-manifest.mjs` – release metadata validation
- `scripts/release.mjs` – atomic release task
- `.github/workflows/` – CI and release asset automation

`main.js` is generated and intentionally ignored by Git. Releases attach the generated bundle alongside
`manifest.json`; the plugin ships no stylesheet.

Manifest validation enforces the `textile-export` directory name for installations below `.obsidian/plugins/`.
Repository checkouts may use the GitHub repository name or another local development directory.

## Working style

- Use strict TypeScript and explicit types at module boundaries.
- Avoid `any`; narrow `unknown` values before use.
- Give each new class a short responsibility docblock and each function a concise intent comment.
- Keep conversion deterministic and free of Obsidian APIs so it stays unit-testable.
- New visible strings belong in `locales/de.json` and `locales/en.json`; keep the keys and placeholders identical.
- Use correct German umlauts and `ß` in German text.
- Update documentation for visible behavior or settings.

## Adding a converter case

Add a `tests/fixtures/<name>.md` input and the expected `tests/fixtures/<name>.textile` output. The fixture test
discovers the pair automatically. Check the expected output against the Textile syntax rather than pasting the converter's
output unreviewed, so the fixture verifies the behavior instead of recording it.

## Quality checks

Run the same checks as CI:

```bash
npm run validate:manifest
npm run typecheck
npm run lint
npm test
npm run build
```

Unit tests cover the converter (inline cases and fixtures), translation tables, language resolution, and persisted
setting validation. UI behavior still requires a manual Obsidian check.

## Releases

Add release notes below `## [Unreleased]`, commit all pending work, and synchronize the branch with its upstream.
Then run the complete release transaction with the next unused version:

```bash
npm run release -- 0.1.1
```

The task updates `manifest.json`, `package.json`, `package-lock.json`, `versions.json`, and `CHANGELOG.md`; runs manifest
validation, lint, tests, and the production build; creates `chore: release <version>` and an annotated tag; then pushes
the branch and tag atomically. It stops before changing files when the working tree is dirty, the branch differs from
its upstream, or the tag already exists. Do not create or move release tags manually.

## Manual checklist

- Export a note from the file explorer context menu and paste the result into a Textile-capable editor.
- Export the same note from the note's "More options" menu.
- Confirm the menu entry is absent for non-Markdown files.
- Switch the language setting and verify the menu entry and notices follow it.

## Contribution checklist

- [ ] The change has a focused purpose.
- [ ] Converter changes have a fixture pair or focused test.
- [ ] Manifest validation, typecheck, lint, tests, and production build pass.
- [ ] README and FEATURES are current.
- [ ] Both locale files contain the same keys.
- [ ] `git diff --check` reports no whitespace errors.
