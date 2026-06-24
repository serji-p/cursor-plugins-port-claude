# pr-review-canvas (Claude Code)

> ⚠️ **Not human-reviewed — use at your own risk.** AI-ported from the Cursor PR Review Canvas plugin, not audited by a human. Read the code before installing. No warranty.

Render a GitHub PR review as an **interactive, self-contained HTML walkthrough** for **Claude Code** — fetch PR data via the `gh` API, reorganize files by reviewer value (core logic → wiring → boilerplate), add annotations, and render diffs with moved-code detection. Ported from the [Cursor PR Review Canvas plugin](https://github.com/cursor/plugins/tree/main/pr-review-canvas) and adapted to Claude Code conventions.

## What changed in the port

Cursor renders this on its native **Canvas** surface via the Canvas SDK (`~/.cursor/skills-cursor/canvas/...`). Claude Code has no Canvas SDK, so the skill instead builds a **standalone HTML page** from a bundled toolkit and opens it locally:

| Area | Cursor | Claude Code (here) |
|------|--------|--------------------|
| Render target | Cursor Canvas (SDK components) | self-contained HTML, opened via `open` or a browser MCP |
| Toolkit | Canvas SDK `.d.ts` exports | bundled `template.html` + `styles.css` + `renderer.js` (dark theme, diff renderer, move detection) |
| Diff source | `gh pr diff` | `gh api .../pulls/{n}/files` + safe JSON injection via Python |
| Trigger | "PR review canvas" | a pasted PR URL + "review this PR" |

## Install

This is a standard Claude Code plugin (`.claude-plugin/plugin.json` + `skills/`), published in the [`cursor-plugins-port-claude`](https://github.com/serji-p/cursor-plugins-port-claude) marketplace.

- **As a managed plugin (recommended):**
  ```
  /plugin marketplace add serji-p/cursor-plugins-port-claude
  /plugin install pr-review-canvas@cursor-plugins-port
  ```
- **Quick personal use:** symlink or copy the skill dir into `~/.claude/skills/`:
  ```bash
  ln -s "$PWD"/skills/* ~/.claude/skills/
  ```

## Skill

| Skill | Description |
|:------|:------------|
| `pr-review-canvas` | Fetch a PR via `gh api`, categorize core vs mechanical files, annotate, and render an interactive HTML diff walkthrough with moved-code detection. |

The skill bundles a prebuilt dark-themed toolkit (`template.html`, `styles.css`, `renderer.js`): collapsible file cards, sticky headers/notes, a unified-diff renderer that filters imports, collapses whitespace-only changes, and tints moved code blocks.

## Overlap with team-kit

`team-kit` (in this same marketplace) also ships a `pr-review-canvas` skill — this mirrors the upstream Cursor layout, where the canvas lives in both `cursor-team-kit` and as a standalone plugin. Claude Code namespaces skills per plugin, so installing both is safe; install this standalone plugin if you want the PR canvas without the rest of the team kit.

## License

MIT (see `LICENSE`), per the upstream Cursor PR Review Canvas plugin.
