# team-kit (Claude Code)

> ⚠️ **Not human-reviewed — use at your own risk.** AI-ported from the Cursor Team Kit, not audited by a human. Read the code before installing. No warranty.

Team workflow kit for **Claude Code** — CI, code review, shipping, and test-reliability skills plus two subagents. Ported from the [Cursor Team Kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) and adapted to Claude Code conventions.

## What changed in the port

| Area | Cursor | Claude Code (here) |
|------|--------|--------------------|
| Skill format | `SKILL.md` with `name`/`description` | Same — frontmatter is compatible |
| `disable-model-invocation` | Cursor field | Dropped (no equivalent; descriptions carry triggers) |
| Subagent frontmatter | `model: fast`, `is_background: true` | `model: haiku`, `tools:`; background noted in description |
| `workflow-from-chats` | reads **Cursor chats** | reads **Claude Code session transcripts** (`~/.claude/projects/.../<id>.jsonl`, or a session-search MCP) |
| Rules (`.mdc`, `alwaysApply`) | always-on Cursor rules | `coding-standards` skill + a paste-in `CLAUDE.md` block |
| PR canvas serving | "in-app browser" | `open` the file, or serve + open in a browser MCP |

## Install

This is a standard Claude Code plugin (`.claude-plugin/plugin.json` + `skills/` + `agents/`), published in the [`cursor-plugins-port-claude`](https://github.com/serji-p/cursor-plugins-port-claude) marketplace.

- **As a managed plugin (recommended):**
  ```
  /plugin marketplace add serji-p/cursor-plugins-port-claude
  /plugin install team-kit@cursor-plugins-port
  ```
- **Quick personal use:** symlink or copy the skill dirs into `~/.claude/skills/` and the agent files into `~/.claude/agents/`:
  ```bash
  ln -s "$PWD"/skills/* ~/.claude/skills/
  ln -s "$PWD"/agents/* ~/.claude/agents/
  ```

## Skills

| Skill | Description |
|:------|:------------|
| `review-and-ship` | Review the branch, run/write tests, commit, open or update a PR |
| `pr-review-canvas` | Generate an interactive HTML PR walkthrough with annotated, categorized diffs |
| `make-pr-easy-to-review` | Clean noisy PR history, improve descriptions, add reviewer guidance |
| `new-branch-and-pr` | Create a fresh branch, complete work, open a PR |
| `fix-ci` | Find failing PR checks, inspect logs, apply focused fixes |
| `fix-merge-conflicts` | Resolve merge conflicts, validate build/tests, summarize decisions |
| `check-compiler-errors` | Run compile/type-check commands and report failures |
| `run-smoke-tests` | Run Playwright smoke tests and triage failures |
| `control-cli` | Build/adapt a local harness to drive and profile interactive CLIs/TUIs |
| `control-ui` | Build/adapt a local browser/CDP harness for web/IDE/Electron UIs |
| `deslop` | Remove AI-generated code slop and clean up style |
| `thermo-nuclear-code-quality-review` | Unusually strict maintainability review (code-judo, 1k-line rule, spaghetti, boundaries) |
| `what-did-i-get-done` | Summarize authored commits over a time period |
| `weekly-review` | Weekly recap with bugfix/tech-debt/net-new highlights |
| `workflow-from-chats` | Extract durable preferences from Claude Code sessions into skills/rules/docs |
| `coding-standards` | TS standards: top-level imports + exhaustive switch (from Cursor rules) |

## Subagents

| Agent | Description |
|:------|:------------|
| `ci-watcher` | Monitor PR checks and return concise pass/fail summaries (run in background) |
| `thermo-nuclear-code-quality-review` | Subagent that runs the thermo-nuclear rubric against a prepared diff |

## Skipped (covered by existing Claude Code tools)

Three Cursor skills were intentionally not ported because Claude Code already ships equivalents:

- `loop-on-ci` → `/loop` + the `ci-watcher` agent here
- `verify-this` → the built-in `/verify` skill
- `get-pr-comments` → the built-in `/review` skill / `gh pr view --comments`

## License

MIT (see `LICENSE`), per the upstream Cursor Team Kit.
