# cursor-plugins-port-claude

A [Claude Code](https://code.claude.com) plugin marketplace with five plugins **ported from [cursor/plugins](https://github.com/cursor/plugins)** and adapted to Claude Code conventions (gh/git, session transcripts, native subagents, `Stop` hooks, self-contained HTML canvases).

Repo: <https://github.com/serji-p/cursor-plugins-port-claude>

> ⚠️ **Not human-reviewed — use at your own risk.** These plugins were ported by an AI agent and have not been audited by a human. The `continual-learning` plugin installs a `Stop` hook that runs on every session and can write to your `CLAUDE.md`. Read the code before installing, and enable on machines/projects you're comfortable experimenting on. No warranty.

| Plugin | What it does | Ported from |
|--------|--------------|-------------|
| [`team-kit`](./team-kit) | CI, code review, shipping, and test-reliability skills + 2 subagents. | [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) |
| [`continual-learning`](./continual-learning) | Cadence-gated `Stop` hook that incrementally mines session transcripts and keeps `CLAUDE.md`'s learned sections current via a subagent. | [continual-learning](https://github.com/cursor/plugins/tree/main/continual-learning) |
| [`thermos`](./thermos) | Deep correctness + security audit, a harsh maintainability rubric, and a `thermos` orchestrator that runs both review subagents in parallel and synthesizes findings. | [thermos](https://github.com/cursor/plugins/tree/main/thermos) |
| [`pr-review-canvas`](./pr-review-canvas) | Render a GitHub PR review as an interactive, self-contained HTML walkthrough with categorized files, annotations, and moved-code-aware diffs. | [pr-review-canvas](https://github.com/cursor/plugins/tree/main/pr-review-canvas) |
| [`docs-canvas`](./docs-canvas) | Render documentation as a navigable, self-contained HTML page with a sticky table of contents, callouts, code blocks, and tables. | [docs-canvas](https://github.com/cursor/plugins/tree/main/docs-canvas) |

## Install

Add this repo as a plugin marketplace, then install any plugin (marketplace name is `cursor-plugins-port`):

```
/plugin marketplace add serji-p/cursor-plugins-port-claude
/plugin install team-kit@cursor-plugins-port
/plugin install continual-learning@cursor-plugins-port
/plugin install thermos@cursor-plugins-port
/plugin install pr-review-canvas@cursor-plugins-port
/plugin install docs-canvas@cursor-plugins-port
```

Or from a local clone:

```
/plugin marketplace add /path/to/cursor-plugins-port-claude
```

See each plugin's own `README.md` for details, cadence/env configuration, and exactly what changed in the port.

## Source & attribution

Both plugins are derived from the upstream **Cursor plugins** repo (<https://github.com/cursor/plugins>), MIT-licensed. This is an independent port to Claude Code and is **not affiliated with or endorsed by Cursor / Anysphere**. Original copyright is retained in each plugin's `LICENSE`.

## License

MIT (see `LICENSE` and each plugin's `LICENSE`), per the upstream Cursor plugins.
