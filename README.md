# cursor-plugins-port-claude

A [Claude Code](https://code.claude.com) plugin marketplace with two plugins **ported from [cursor/plugins](https://github.com/cursor/plugins)** and adapted to Claude Code conventions (gh/git, session transcripts, native subagents, `Stop` hooks).

Repo: <https://github.com/serji-p/cursor-plugins-port-claude>

| Plugin | What it does | Ported from |
|--------|--------------|-------------|
| [`team-kit`](./team-kit) | CI, code review, shipping, and test-reliability skills + 2 subagents. | [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) |
| [`continual-learning`](./continual-learning) | Cadence-gated `Stop` hook that incrementally mines session transcripts and keeps `CLAUDE.md`'s learned sections current via a subagent. | [continual-learning](https://github.com/cursor/plugins/tree/main/continual-learning) |

## Install

Add this repo as a plugin marketplace, then install either plugin (marketplace name is `claude-plugins`):

```
/plugin marketplace add serji-p/cursor-plugins-port-claude
/plugin install team-kit@claude-plugins
/plugin install continual-learning@claude-plugins
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
