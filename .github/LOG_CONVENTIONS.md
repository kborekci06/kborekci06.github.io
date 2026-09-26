# Commit conventions

Full rules: `.github/gitmessage.txt` (also the commit template).

## One-time setup

Run once from anywhere inside the repo:

```sh
git config --local commit.template "$(git rev-parse --show-toplevel)/.github/gitmessage.txt"
```

Every `git commit` without `-m` now opens the template in your editor. Lines starting with `#` are stripped; saving the file commits.

## Quick reference

```
<type>(<scope>): <subject>          # imperative, lowercase, no period, <= 50 chars

<body: why, wrapped at 72>

Refs: DES-009                       # ISSUE_LOG IDs, one per line
Closes: FUN-002
```

## Workflow with Claude Code

1. Stage one logical change: `git add -p`.
2. Run `/commit`. The skill (`.claude/skills/commit/SKILL.md`) reads the staged diff, drafts the message, and waits for approval before committing. It never stages files.
3. After the commit, update the issue's `Status` in `ISSUE_LOG.md`.

## ISSUE_LOG references

- `Closes: <ID>` when the commit finishes the issue; `Refs: <ID>` when it advances it.
- IDs follow `<CAT>-<nnn>`, CAT in DES, FUN, UX, UI, PERF, CON, REPO.

## Never committed

- Claude-only files: `CLAUDE.md`, `CONTEXT.md`, `FILE_MAP.md`, `ISSUE_LOG.md`, `ROADMAP.md`, `.claude/` (all gitignored).
- `.DS_Store` and build output (`_site/`, `.jekyll-cache/`).
- Check `git diff --staged --name-only` before every commit.

## Why `.github/`

Jekyll skips any entry whose name starts with `.`, `_`, `#`, or `~` unless listed under `include:` in `_config.yml` (`lib/jekyll/entry_filter.rb`, Jekyll 3.10.0). Files here are never published to the site.
