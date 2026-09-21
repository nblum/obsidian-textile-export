# Project Agent Skills

This directory contains workflows specific to plugin. `AGENTS.md` remains a concise project map and
directs an agent here only when a task matches a documented workflow.

## Layout

```text
agent-skills/
├── README.md
├── fix-plugin-diff-bug/
│   ├── SKILL.md
│   └── agents/openai.yaml
├── commit-plugin-diff/
│   ├── SKILL.md
│   └── agents/openai.yaml
└── publish-obsidian-plugin-release/
    ├── SKILL.md
    └── agents/openai.yaml
```

## Available Skills

- `fix-plugin-diff-bug` fixes a reported bug with a regression test and a changelog entry.
- `commit-plugin-diff` creates focused commits without pushing, tagging, or publishing.
- `publish-obsidian-plugin-release` prepares a release and hands the publishing command to the user.

## Maintaining Skills

Keep each skill limited to one recurring workflow. Store shared instructions in `AGENTS.md`, project knowledge in
the existing documentation, and conditional or procedural guidance in the relevant skill. Add scripts, references,
or assets only when they directly improve that workflow.
