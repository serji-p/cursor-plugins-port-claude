# Project Status — 2026-06-23

## Current state
- Mono-repo `cursor-plugins-port` (marketplace name) published at github.com/serji-p/cursor-plugins-port-claude. **Five** plugins ported from cursor/plugins.
- **team-kit** (v0.1.0): 16 skills + 2 agents (CI/review/shipping/test-reliability).
- **continual-learning** (v1.1.0): Stop hook → `continual-learning` skill → `agents-memory-updater` + `global-memory-curator` (cross-project scan → global `~/.claude/CLAUDE.md`). Weekly scheduled `weekly-global-memory-curation` task.
- **thermos** (v1.0.0, NEW): 3 skills (`thermo-nuclear-review`, `thermo-nuclear-code-quality-review`, `thermos` orchestrator) + 2 subagents. Adapted to Claude `Agent`-tool dispatch, `tools:`/`model: inherit` on agents, `gh`/`glab` for PR discussion. Overlaps team-kit's code-quality skill (mirrors upstream's intentional duplication; safe — namespaced per-plugin).
- **pr-review-canvas** (v1.0.0, NEW): standalone plugin lifting team-kit's already-adapted PR canvas skill (self-contained HTML via `template.html`/`styles.css`/`renderer.js`, opened locally).
- **docs-canvas** (v1.0.0, NEW): upstream is a placeholder; **fleshed out** into a working skill — bundled docs toolkit (sticky auto-TOC + scroll-spy, anchor links, copy buttons, callouts, tables, opt-in mermaid) producing a self-contained HTML doc. Assembly smoke-tested (HTML well-formed, `node --check` clean).
- Upstream-update check: **no upstream changes since the June 15 fork**. Last `cursor-team-kit` change 2026-05-28, last `continual-learning` change 2026-03-13; June 17 upstream HEAD only touched `pstack`. Nothing to merge.
- All READMEs carry the AI-ported / not-human-reviewed / use-at-your-own-risk disclaimer.

## In progress
- None.

## Blockers
- None.

## Open questions
- None.

## Next steps
1. `git push` (new plugins + manifest/README/STATUS updates are local-only, ahead of origin).
2. To make the new plugins installable: `/plugin marketplace update cursor-plugins-port`, then `/plugin install thermos@cursor-plugins-port` (and `pr-review-canvas`, `docs-canvas`).
3. Optional: open a `docs-canvas` / `pr-review-canvas` output page in a browser to eyeball the live render before relying on them.
