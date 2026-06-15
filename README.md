# claude-plugins

A Claude Code plugin marketplace with two plugins, ported from the [Cursor plugins](https://github.com/cursor/plugins) repo and adapted to Claude Code conventions (gh/git, session transcripts, native subagents, `Stop` hooks).

| Plugin | What it does |
|--------|--------------|
| [`team-kit`](./team-kit) | CI, code review, shipping, and test-reliability skills + 2 subagents. Ported from the Cursor Team Kit. |
| [`continual-learning`](./continual-learning) | Cadence-gated `Stop` hook that incrementally mines session transcripts and keeps `CLAUDE.md`'s learned sections current via a subagent. Ported from the Cursor continual-learning plugin. |

## Install

Add this repo as a plugin marketplace, then install either plugin:

```
/plugin marketplace add <your-github-user>/claude-plugins
/plugin install team-kit@claude-plugins
/plugin install continual-learning@claude-plugins
```

Or install from a local clone:

```
/plugin marketplace add /path/to/claude-plugins
```

See each plugin's own `README.md` for details, cadence/env configuration, and what changed in the port.

## License

MIT (see each plugin's `LICENSE`), per the upstream Cursor plugins.
