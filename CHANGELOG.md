# Changelog

All notable changes to Textile Export are documented here.

## [Unreleased]

- fixes conversion and test on with CRLF line endings

## [0.2.0] - 2026-09-21

### Added

- Added German and English translations with automatic Obsidian-language detection and a manual language setting.
- Added fixture-based converter tests covering headings, text formatting, list styles, nested lists, tables, images,
  and a combined note.
- Added manifest validation, CI on Linux, macOS, and Windows, an atomic release task, and a release workflow that
  publishes attested assets.
- Added `FEATURES.md`, `CONTRIBUTING.md`, and this changelog.
- Added Obsidian image sizes (`![alt|300](url)`, `![[file.png|300]]`) and image embeds, exported as
  `!{width:300px}file.png!`.
- Added the setting **Export images as Redmine thumbnails** to write local images as `{{thumbnail(file.png)}}` macros.
- Added an **About me** section to the settings with links to the developer website, the GitHub repository, and the
  feedback page.

### Changed

- Renamed the plugin to Textile Export with the ID `textile-export`. Enable `textile-export` instead of
  `redmine-export` and install the plugin in `.obsidian/plugins/textile-export/`.

### Fixed

- Fixed headings swallowing the neighbouring line: a blank line is now emitted before and after every `hN.` heading, so
  a list or paragraph directly below a Markdown heading is no longer rendered as part of the heading.
- Fixed a line containing a pipe, such as `![[image.png|540]]`, being read as a table header when a `---` line follows;
  header and separator rows now need the same column count.
- Fixed escaped pipes (`\|`) splitting Markdown table cells.
- Fixed nested lists indented with tabs or four spaces skipping Textile levels.
- Fixed ordered lists inside unordered lists and vice versa; they now use the combined Textile markers (`*#`, `#*`).

## [0.1.0] - 2026-09-02

### Added

- Added an **Export to Redmine** file menu entry that copies a note as Redmine wiki (Textile) markup.
- Added conversion of headings, emphasis, strikethrough, inline code, code blocks, links, images, wikilinks, lists,
  blockquotes, and tables.
