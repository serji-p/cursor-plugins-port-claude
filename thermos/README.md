# thermos (Claude Code)

> ⚠️ **Not human-reviewed — use at your own risk.** AI-ported from the Cursor Thermos plugin, not audited by a human. Read the code before installing. No warranty.

Thermo-nuclear branch review for **Claude Code** — deep correctness + security audits, a harsh maintainability rubric, and a `thermos` orchestrator that runs both review subagents in parallel and synthesizes findings. Ported from the [Cursor Thermos plugin](https://github.com/cursor/plugins/tree/main/thermos) and adapted to Claude Code conventions.

## What changed in the port

| Area | Cursor | Claude Code (here) |
|------|--------|--------------------|
| `disable-model-invocation` | Cursor field | Dropped (no equivalent; descriptions carry the triggers) |
| Subagent frontmatter | `name` + `description` only | adds `tools:` + `model: opus` |
| Parallel dispatch | `Task` calls, `subagent_type: "shell"` / `"explore"` | `Agent` tool in one message; path-based inputs from a single `git diff` via Bash (no Explore agent, no pasted file contents) |
| Skill loading | "load the skill" | invoke via the `Skill` tool |
| Review-bot lookup | "BugBot" | review bots / human threads via `gh` / `glab` |

## Install

This is a standard Claude Code plugin (`.claude-plugin/plugin.json` + `skills/` + `agents/`), published in the [`cursor-plugins-port-claude`](https://github.com/serji-p/cursor-plugins-port-claude) marketplace.

- **As a managed plugin (recommended):**
  ```
  /plugin marketplace add serji-p/cursor-plugins-port-claude
  /plugin install thermos@cursor-plugins-port
  ```
- **Quick personal use:** symlink or copy the skill dirs into `~/.claude/skills/` and the agent files into `~/.claude/agents/`:
  ```bash
  ln -s "$PWD"/skills/* ~/.claude/skills/
  ln -s "$PWD"/agents/* ~/.claude/agents/
  ```

## Skills

| Skill | Description |
|:------|:------------|
| `thermo-nuclear-review` | Deep branch audit — bugs, breakages, security, devex regressions, feature-gate leaks. |
| `thermo-nuclear-code-quality-review` | Strict maintainability audit — code-judo, 1k-line rule, spaghetti, boundaries. |
| `thermos` | Run one review round — both subagents in parallel (full mode) or one verify subagent (verify mode) — and synthesize deduped, prioritized findings. |

## Subagents

| Agent | Description |
|:------|:------------|
| `thermo-nuclear-review-subagent` | Subagent for the deep review rubric (diff-scoped). |
| `thermo-nuclear-code-quality-review-subagent` | Subagent for the code-quality rubric (diff-scoped). |

## Typical usage

`thermos` runs **exactly one round per invocation** — it never loops on its own. Round limits
are the caller's contract: a batch workflow that wants "round 1 = full review → fixes → round 2
= verify" calls the `thermos` skill twice, the second time with `mode=verify`.

**Args** (optional, `key=value`): `base=<ref>` (default `main`), `out=<dir>` (default
`<scratchpad>/thermos`), `round=<N>` (default `1`), `mode=full|verify` (default `full`),
`findings=<path>` + `since=<sha>` (both required for `verify`), `context=<path>` (optional
ticket/AC summary).

**Full mode** (`mode=full`, the default):

1. One Bash call writes `<out>/round-<N>.diff` (`git diff <base>...HEAD`) and
   `<out>/round-<N>.files.txt` (changed files + line counts) — no Explore agent, no diff/file
   contents pasted into subagent prompts.
2. Dispatch both subagents via the `Agent` tool in a single message (optionally
   `run_in_background: true`), each given only paths (diff, files list, optional context,
   output JSON). Each reads files itself (Grep first, then Read by offset/limit for large
   files) and writes `<out>/round-<N>.bugs.json` / `<out>/round-<N>.quality.json`.
3. Synthesize into `<out>/round-<N>.json` (merged findings) + `<out>/round-<N>.md` (human
   summary, first line `BLOCKING: <count>`).

**Verify mode** (`mode=verify`, needs `findings=` from the previous round + `since=<sha>`):

1. Parent writes `<out>/round-<N>.diff` = `git diff <since>..HEAD` and
   `<out>/round-<N>.files.txt` = `git diff --name-only <since>..HEAD` + line counts (same
   files-list contract as full mode).
2. Dispatches **one** `thermo-nuclear-review-subagent` with verify instructions: carry every
   prior finding forward unchanged except `status` (re-checking `open` ones for resolved/open
   with evidence, never dropping resolved/low findings), then — unless the delta diff is empty
   — scan it for new issues using both lenses' rubrics, numbered `V<n>` from `max(existing V)+1`.
   Writes `<out>/round-<N>.verify.json`.
3. Synthesize as above. An empty delta diff still re-checks prior findings; a `since` that no
   longer resolves on this branch (rebase/squash) stops with a report instead of guessing, and
   suggests re-running with `mode=full`.

**Findings format:** see `thermos/skills/thermos/references/findings-format.md` for the JSON
schema (`round`, `mode`, `base`, `reviewed_sha`, `findings[]` with stable `B<n>`/`Q<n>`/`V<n>`
ids) and the critical/high/medium/low severity definitions.

**Single skill:** invoke `thermo-nuclear-review` or `thermo-nuclear-code-quality-review` directly
in the main agent, or dispatch the matching subagent standalone — it needs the same path-based
inputs `thermos` gives it: a diff file, a changed-files list, and an output JSON path (not just
"gathered diff context").

## Overlap with team-kit

See `team-kit`'s README for what changed there — `thermos` is the only place this review lives.

## License

MIT (see `LICENSE`), per the upstream Cursor Thermos plugin.
