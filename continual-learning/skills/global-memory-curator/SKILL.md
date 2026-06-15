---
name: global-memory-curator
description: Review many projects and enrich/optimize the user's GLOBAL ~/.claude/CLAUDE.md. Use to "curate global memory", "promote project learnings to my global CLAUDE.md", "review/optimize my main CLAUDE.md", or as a weekly cross-project memory pass. Mines each project's CLAUDE.md / AGENTS.md / continual-learning state for recurring user-level patterns, reviews the global file for bad patterns and bloat, then proposes (and on approval applies) changes.
---

# Global memory curator

Cross-project, global-level counterpart to continual-learning. Where `continual-learning` keeps each project's `CLAUDE.md` current, this skill looks **across all projects** under a root folder and curates the user's **global** `~/.claude/CLAUDE.md`.

Run it manually, or on a weekly schedule. It runs in a folder that contains many projects (default: the current working directory).

## Modes

- **Interactive (default):** analyze → present report + proposed diff → on the user's explicit approval, apply to `~/.claude/CLAUDE.md` with a backup.
- **Suggest-only:** analyze → present/save the report + proposed diff, **never apply**. Always use this for non-interactive / scheduled runs (no human to approve). Triggered when the invocation says "suggest only" / "do not apply", or when running unattended.

## Workflow

1. Resolve `ROOT` (folder containing the projects; default = cwd) and `GLOBAL` = `~/.claude/CLAUDE.md`.
2. Dispatch the **`global-memory-curator` subagent** (via the Agent tool) with `ROOT` and `GLOBAL`. It is read-only and returns:
   - cross-project promotion candidates (with source projects + confidence),
   - global-file findings (bad patterns + optimizations),
   - a proposed unified diff for `GLOBAL`,
   - deliberately-excluded items and any blocking questions.
3. Present the subagent's report and the proposed diff to the user clearly.
4. **Apply step (interactive mode only):**
   - Ask for explicit approval. If anything is ambiguous or risky, ask first.
   - On approval: **back up** `GLOBAL` (`cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.bak-<timestamp>`), then apply only the approved hunks via Edit. Re-read after to confirm the file is still valid and intentional content is intact.
   - On decline: change nothing.
5. **Suggest-only mode:** skip the apply. Save the report to `~/.claude/memory-curator-reports/<YYYY-MM-DD>.md` and surface a short summary (and a notification if running unattended). Do not edit `GLOBAL`.

## Guardrails

- The global `~/.claude/CLAUDE.md` is hand-maintained — treat it carefully. **Never** edit it without explicit per-run user approval, and always back it up first.
- Promote only **user-level** rules/preferences (how the user wants the agent to work). Leave project-specific facts (stacks, build commands, paths, service names) in their project files.
- Never copy secrets, credentials, or customer data into the global file.
- Prefer a small number of high-confidence promotions and high-value optimizations over churn.
- Preserve intentional global content (e.g. the STATUS.md maintenance rule, memory/hook instructions); if a change would touch it, ask rather than assume.

## Output

- A concise report: promotion candidates, global-file findings, the proposed diff, exclusions.
- Interactive: confirmation of what was applied + the backup path, or "no changes applied".
- Suggest-only: the saved report path + a short summary.
