# Continual Learning (Claude Code)

Automatically and incrementally keeps **`./CLAUDE.md`** up to date from Claude Code session-transcript changes. Ported from the [Cursor continual-learning plugin](https://github.com/cursor/plugins/tree/main/continual-learning).

The plugin combines:

- A **`Stop` hook** that decides when to trigger learning (cadence-gated).
- A **`continual-learning`** skill that orchestrates the flow.
- An **`agents-memory-updater`** subagent that mines new/changed transcripts and updates `CLAUDE.md`.

It avoids noisy rewrites by reading existing `CLAUDE.md` first and updating matching bullets in place, processing only new/changed transcripts, and writing plain bullets only (no evidence/confidence metadata).

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

**Enabled globally** for this machine by:
1. Symlinking the skill + agent into `~/.claude/skills` and `~/.claude/agents`.
2. Adding a `Stop` hook to `~/.claude/settings.json`:
   ```json
   { "type": "command", "command": "bun run $HOME/continual-learning/hooks/continual-learning-stop.ts", "timeout": 30 }
   ```

To **disable**: remove that hook entry from `~/.claude/settings.json` (the `check-status-md.sh` Stop hook stays untouched). The skill/agent can stay — they only act when invoked.

To install elsewhere as a managed plugin instead, point a plugin marketplace at this directory (`.claude-plugin/plugin.json` + `hooks/hooks.json` use `${CLAUDE_PLUGIN_ROOT}`).

## License

MIT (see `LICENSE`), per the upstream Cursor plugin.
