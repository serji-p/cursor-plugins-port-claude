# docs-canvas (Claude Code)

> ⚠️ **Not human-reviewed — use at your own risk.** AI-ported from the Cursor Docs Canvas plugin, not audited by a human. Read the code before installing. No warranty.

Render documentation — architecture notes, API references, design docs, runbooks, codebase walkthroughs — as an **interactive, navigable, self-contained HTML page** for **Claude Code**, instead of a flat markdown file. Ported from the [Cursor Docs Canvas plugin](https://github.com/cursor/plugins/tree/main/docs-canvas) and adapted to Claude Code conventions.

## What changed in the port

Upstream Docs Canvas is an explicit **placeholder/scaffold** that targets Cursor's native Canvas surface via the Canvas SDK (`~/.cursor/skills-cursor/canvas/...`). Claude Code has no Canvas SDK, so this port **fleshes out the skill into a working renderer**: it bundles a dark-themed toolkit that builds a standalone HTML doc and opens it locally — the same approach as `pr-review-canvas` in this marketplace.

| Area | Cursor | Claude Code (here) |
|------|--------|--------------------|
| Skill body | placeholder outline + "read the Canvas SDK" | complete, working skill with a structure contract |
| Render target | Cursor Canvas (SDK components) | self-contained HTML, opened via `open` or a browser MCP |
| Toolkit | Canvas SDK `.d.ts` exports | bundled `template.html` + `styles.css` + `renderer.js` |
| TOC / navigation | SDK navigation primitives | auto-generated sticky TOC with scroll-spy + anchor links |
| Diagrams | SDK diagram components | inline SVG / ASCII, or opt-in mermaid via CDN |

## Install

This is a standard Claude Code plugin (`.claude-plugin/plugin.json` + `skills/`), published in the [`cursor-plugins-port-claude`](https://github.com/serji-p/cursor-plugins-port-claude) marketplace.

- **As a managed plugin (recommended):**
  ```
  /plugin marketplace add serji-p/cursor-plugins-port-claude
  /plugin install docs-canvas@cursor-plugins-port
  ```
- **Quick personal use:** symlink or copy the skill dir into `~/.claude/skills/`:
  ```bash
  ln -s "$PWD"/skills/* ~/.claude/skills/
  ```

## Skill

| Skill | Description |
|:------|:------------|
| `docs-canvas` | Build a navigable HTML doc — overview, auto-generated sticky TOC, mixed prose/code/diagram sections, callouts, tables, references. |

The skill bundles a prebuilt dark-themed toolkit (`template.html`, `styles.css`, `renderer.js`): a two-column layout, an auto-generated table of contents with scroll-spy, anchor links on headings, copy buttons on code blocks, colored callouts (note / tip / important / warning / deprecated), styled tables, and an opt-in mermaid hook.

## When to use

- Rendering architecture notes, design docs, or RFCs as something you can scan, not just read top-to-bottom.
- Turning a directory of markdown docs, or one large doc, into a page with jump navigation.
- Answering a codebase question with a layout richer than a single reply — sections, diagrams, tables, callouts.

Trigger it with phrases like "docs canvas", "documentation overview", "architecture walkthrough", "API reference page", or "render this doc as an interactive page".

## License

MIT (see `LICENSE`), per the upstream Cursor Docs Canvas plugin.
