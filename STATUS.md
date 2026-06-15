# Project Status — 2026-06-15

## Current state
- Mono-repo `cursor-plugins-port` (marketplace name) published at github.com/serji-p/cursor-plugins-port-claude. Two plugins ported from cursor/plugins.
- **team-kit** (v0.1.0): 16 skills + 2 agents (CI/review/shipping/test-reliability). Installed as managed plugin (`team-kit@cursor-plugins-port`).
- **continual-learning** (v1.1.0): Stop hook → `continual-learning` skill → `agents-memory-updater` (per-project transcript mining into CLAUDE.md). Installed + enabled. Stop hook live (trial mode).
- New in v1.1.0: `global-memory-curator` skill + read-only subagent — cross-project scan of CLAUDE.md/AGENTS.md/CL-state → promotes recurring user-level patterns into global `~/.claude/CLAUDE.md`, reviews it for bad patterns. Interactive (apply-on-approval, backed up) or suggest-only.
- Weekly scheduled task `weekly-global-memory-curation` (Mon 09:00 local, suggest-only) writes a report to `~/.claude/memory-curator-reports/<date>.md`.
- READMEs carry an AI-ported / not-human-reviewed / use-at-your-own-risk disclaimer.

## In progress
- None.

## Blockers
- None.

## Open questions
- None.

## Next steps
1. `git push` (local commits ahead of origin: docs + global-memory-curator feature).
2. To make v1.1.0 / the `global-memory-curator` skill live: `/plugin marketplace update cursor-plugins-port` then reinstall `continual-learning@cursor-plugins-port`.
3. Optional: "Run now" the scheduled task once to pre-approve tool permissions for unattended runs.
