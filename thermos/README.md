# thermos (Claude Code)

> ⚠️ **Not human-reviewed — use at your own risk.** AI-ported from the Cursor Thermos plugin, not audited by a human. Read the code before installing. No warranty.

Thermo-nuclear branch review for **Claude Code** — deep correctness + security audits, a harsh maintainability rubric, and a `thermos` orchestrator that runs both review subagents in parallel and synthesizes findings. Ported from the [Cursor Thermos plugin](https://github.com/cursor/plugins/tree/main/thermos) and adapted to Claude Code conventions.

## What changed in the port

| Area | Cursor | Claude Code (here) |
|------|--------|--------------------|
| `disable-model-invocation` | Cursor field | Dropped (no equivalent; descriptions carry the triggers) |
| Subagent frontmatter | `name` + `description` only | adds `tools:` + `model: inherit` |
| Parallel dispatch | `Task` calls, `subagent_type: "shell"` / `"explore"` | `Agent` tool in one message; `Explore` agent + `git diff` via Bash |
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
| `thermos` | Run both review subagents in parallel and synthesize deduped, prioritized findings. |

## Subagents

| Agent | Description |
|:------|:------------|
| `thermo-nuclear-review-subagent` | Subagent for the deep review rubric (diff-scoped). |
| `thermo-nuclear-code-quality-review-subagent` | Subagent for the code-quality rubric (diff-scoped). |

## Typical usage

**Double review (`thermos`):**

1. Gather `git diff main...HEAD` and full contents of changed files (Bash + an `Explore` agent in one message).
2. Dispatch both subagents via the `Agent` tool in a single message (optionally `run_in_background: true`).
3. Synthesize prioritized, deduped findings.

**Single skill:** invoke `thermo-nuclear-review` or `thermo-nuclear-code-quality-review` in the main agent, or the matching subagent after gathering diff context.

## Overlap with team-kit

`team-kit` (in this same marketplace) also ships a `thermo-nuclear-code-quality-review` skill + subagent — this mirrors the upstream Cursor layout, where the code-quality review lives in both `cursor-team-kit` and `thermos`. Claude Code namespaces skills/agents per plugin (`team-kit:…` vs `thermos:…`), so installing both is safe; you'll just see the code-quality entry twice. Install `thermos` if you want the **deep** review and the parallel `thermos` orchestrator; `team-kit` alone covers only code-quality.

## License

MIT (see `LICENSE`), per the upstream Cursor Thermos plugin.
