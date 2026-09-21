---
name: publish-plugin-release
description: Prepares a plugin release for manual publishing after the user gives a concrete SemVer version. It never creates commits, tags, or pushes.
---

# Prepare Obsidian Plugin Release

Use this skill only in the plugin repository. It prepares a release for the user to publish manually; it
never runs the release workflow itself.

## Inspect the Release

- Verify that `scripts/release.mjs`, `manifest.json`, and `versions.json` exist.
- Ask for a target version in `x.y.z` format when none is provided; never infer it from the changes.
- Confirm that `CHANGELOG.md` contains the exact heading `## [Unreleased]` with release notes beneath it; the release
  script rejects an unbracketed `## Unreleased` heading.
- Review the current manifest version and working tree. Report any release blocker, including a dirty tree, without
  cleaning, committing, discarding, or stashing user changes.

## Hand Off Publishing

- Do not run `npm run release`, create a release commit or tag, push, or otherwise publish—even after the user has
  approved a version.
- When the repository is ready, tell the user to run this command themselves from the plugin folder:

```bash
npm run release -- <version>
```

  Replace `<version>` with the requested version. Explain that the command validates the plugin, creates the release
  commit and annotated tag, and pushes them atomically.
- After the user has run it, offer to inspect the resulting Git status, commit, tag, or GitHub release workflow on
  request.
