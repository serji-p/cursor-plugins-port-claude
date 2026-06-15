# Continual Learning (Claude Code)

> ⚠️ **Not human-reviewed — use at your own risk.** AI-ported, not audited by a human. This plugin installs a `Stop` hook that runs every session and can write to your `CLAUDE.md`. Read the code before installing. No warranty.

Automatically and incrementally keeps **`./CLAUDE.md`** up to date from Claude Code session-transcript changes. Ported from the [Cursor continual-learning plugin](https://github.com/cursor/plugins/tree/main/continual-learning).

The plugin combines:

- A **`Stop` hook** that decides when to trigger learning (cadence-gated).
- A **`continual-learning`** skill that orchestrates the per-project flow.
- An **`agents-memory-updater`** subagent that mines new/changed transcripts and updates that project's `CLAUDE.md`.
- A **`global-memory-curator`** skill (+ subagent) for the cross-project / global level — see below.

It avoids noisy rewrites by reading existing `CLAUDE.md` first and updating matching bullets in place, processing only new/changed transcripts, and writing plain bullets only (no evidence/confidence metadata).

## Global memory curator (cross-project)

`continual-learning` keeps each *project's* `CLAUDE.md` current. The **`global-memory-curator`** skill works one level up: run it in a folder that holds many projects and it will

- mine every project's `CLAUDE.md`, `AGENTS.md`, and continual-learning state for **recurring user-level** rules/preferences,
- propose promoting the durable, cross-project ones into your **global `~/.claude/CLAUDE.md`**,
- review that global file for bad patterns, contradictions, duplication, staleness, and leaked project-specifics, and
- return a report + a proposed diff.

Modes: **interactive** (analyze → show diff → apply on your explicit approval, with a backup) or **suggest-only** (analyze → save/show report, never edit the file — always used for unattended/scheduled runs). Run it manually (`/continual-learning`-style invocation of `global-memory-curator`) or on a weekly schedule.

## Is this in stock Claude Code?

No. CC has **auto memory** (Claude saves things *during* a session to `~/.claude/projects/<proj>/memory/`) and manual `CLAUDE.md` / `#` / `/memory`. None of them mine *past transcripts on a cadence* and incrementally fold them into memory — which is what this plugin does.

## What changed in the port

| Area | Cursor | Claude Code (here) |
|------|--------|--------------------|
| Hook event | Cursor `stop` (`loop_count`, `status`, `generation_id`) | CC `Stop` (`stop_hook_active`, `transcript_path`, `cwd`) |
| "Continue with instruction" | `{ followup_message }` | `{ hookSpecificOutput: { hookEventName: "Stop", additionalContext } }` |
| Loop guard | n/a | `stop_hook_active` short-circuit + CC's 8-block cap |
| Turn counting | `status==="completed" && loop_count===0` | one count per non-continuation `Stop` |
| Memory file | `AGENTS.md` | **`./CLAUDE.md`** (CC auto-loads it) |
| Transcripts | `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.claude/projects/<slug>/<session>.jsonl` |
| State / index | `.cursor/hooks/state/` | `./.claude/continual-learning/` |
| Runtime | `bun run *.ts` | same (`bun` — confirmed installed) |

## Runtime files (per project)

Created in whatever project you're working in:

- `./.claude/continual-learning/continual-learning.json` — cadence state
- `./.claude/continual-learning/continual-learning-index.json` — incremental transcript index

Add to `.gitignore`:

```
.claude/continual-learning/
```

## Trigger cadence

Default:
- min 10 completed turns
- min 120 minutes since last run
- transcript mtime must have advanced

Trial mode (set `CONTINUAL_LEARNING_TRIAL_MODE=1`):
- min 3 turns, min 15 minutes
- expires 24h after first turn, then falls back to default

## Env overrides

- `CONTINUAL_LEARNING_MIN_TURNS`, `CONTINUAL_LEARNING_MIN_MINUTES`
- `CONTINUAL_LEARNING_TRIAL_MODE`
- `CONTINUAL_LEARNING_TRIAL_MIN_TURNS`, `CONTINUAL_LEARNING_TRIAL_MIN_MINUTES`, `CONTINUAL_LEARNING_TRIAL_DURATION_MINUTES`

(Legacy `CONTINUOUS_LEARNING_*` aliases are also honored.)

## Output sections in CLAUDE.md

Only these two managed sections, each a plain bullet list (≤12 bullets):

- `## Learned User Preferences`
- `## Learned Workspace Facts`

## Install / enable

**As a managed plugin** (recommended) — via the marketplace in this repo:

```
/plugin marketplace add serji-p/cursor-plugins-port-claude
/plugin install continual-learning@cursor-plugins-port
```

`hooks/hooks.json` registers the `Stop` hook with `${CLAUDE_PLUGIN_ROOT}` and enables trial mode (`CONTINUAL_LEARNING_TRIAL_MODE=1`).

**Manual / global enable** (what's wired on the author's machine):
1. Symlink the skill + agent into `~/.claude/skills` and `~/.claude/agents`.
2. Add a `Stop` hook to `~/.claude/settings.json`:
   ```json
   { "type": "command", "command": "CONTINUAL_LEARNING_TRIAL_MODE=1 bun run $HOME/claude-plugins/continual-learning/hooks/continual-learning-stop.ts", "timeout": 30 }
   ```

To **disable**: remove that hook entry from `~/.claude/settings.json` (any other Stop hooks stay untouched). The skill/agent can stay — they only act when invoked.

## License

MIT (see `LICENSE`), per the upstream Cursor plugin.
