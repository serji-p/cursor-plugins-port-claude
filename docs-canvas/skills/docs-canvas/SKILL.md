---
name: docs-canvas
description: Render documentation — architecture notes, API references, design docs, runbooks, codebase walkthroughs — as an interactive, navigable, self-contained HTML page (sticky table of contents, sections, callouts, code blocks, tables, optional diagrams) instead of a flat markdown file. Use when the user asks for a docs canvas, documentation overview, architecture walkthrough, API reference page, or wants structured docs rendered as an interactive page.
---

# Docs Canvas

Build a self-contained HTML page that presents documentation — architecture notes, API references, design docs, runbooks, or codebase walkthroughs — as an interactive, navigable surface rather than a flat markdown file. It ships a prebuilt dark-themed toolkit (`template.html`, `styles.css`, `renderer.js`) that auto-generates a sticky table of contents with scroll-spy, anchor links, and copy buttons, so you focus on the content.

## 1. Gather the source material

Accept any of: a directory of markdown files, a single doc URL, an inline outline, or a question to answer from the codebase. Collect headings, code blocks, diagrams, and cross-references. If the request is a codebase question, read the relevant files first and cite them.

## 2. Plan the layout

Decide the top-level structure before writing components. A docs canvas usually leads with:

1. **Overview** — short summary: purpose, scope, audience. A `.card-grid` of key facts works well here.
2. **Table of contents** — generated automatically from your sections (see below); you don't write it by hand.
3. **Body sections** — one `.doc-section` per logical unit (architecture, API, examples, gotchas), mixing prose, code, diagrams, callouts.
4. **References** — links to related docs, source files, RFCs, external material.

Those are a floor, not a ceiling. The goal is the fastest path for the reader to understand the topic — reach for whatever representation helps: a diagram, a sequence chart, a side-by-side comparison, a decision tree, a glossary, a curated FAQ, a single large worked example.

## 3. Write the body HTML

Write everything that goes inside `<body>` to a temp file (e.g. `/tmp/docs-canvas-body.html`). Use this structure so the renderer can build the TOC and scroll-spy:

```html
<div class="doc-header">
  <h1>Payments Service — Architecture</h1>
  <p class="subtitle">How charges flow from API to ledger, and where to extend it.</p>
  <div class="doc-meta">
    <span class="tag">v2.3</span><span class="tag">backend</span><span>Updated 2026-06</span>
  </div>
</div>

<div class="doc-layout">
  <nav class="toc" id="toc"></nav>            <!-- filled automatically; leave empty -->
  <main class="doc-content">

    <section class="doc-section" data-toc="Overview">
      <h2>Overview</h2>
      <div class="card-grid">
        <div class="card"><h4>Purpose</h4><p>Authorize and capture card charges.</p></div>
        <div class="card"><h4>Audience</h4><p>Backend + on-call engineers.</p></div>
      </div>
      <p>The service exposes a single <code>POST /charges</code> endpoint…</p>
    </section>

    <section class="doc-section" data-toc="Request flow">
      <h2>Request flow</h2>
      <div class="callout important">
        <div class="callout-title">Key invariant</div>
        <p>A charge is never captured before the idempotency key is persisted.</p>
      </div>
      <h3>Validation</h3>
      <p>…</p>
      <pre><code>POST /charges
{ "amount": 1200, "currency": "usd", "source": "tok_..." }</code></pre>
    </section>

    <section class="references doc-section" data-toc="References">
      <h2>References</h2>
      <ul>
        <li><a href="...">Ledger service RFC</a></li>
        <li><code>src/payments/charge.ts:42</code> — capture logic</li>
      </ul>
    </section>

  </main>
</div>
```

**How the TOC works:** the renderer scans every `<section class="doc-section">` inside `.doc-content`, uses its `data-toc` attribute (or its `<h2>` text) as the TOC label, auto-assigns `id`s, adds `<h3>`s as sub-entries, and wires up scroll-spy highlighting + anchor links. Leave `<nav class="toc" id="toc">` empty. To omit an `<h3>` from the TOC, add `data-toc="skip"` to it.

## 4. Toolkit reference

Read [styles.css](styles.css) and [renderer.js](renderer.js) from this skill directory for the full surface. The most useful pieces:

| Class / element | Purpose |
|-----------------|---------|
| `.doc-header`, `.subtitle`, `.doc-meta .tag` | Page header, one-line subtitle, metadata tags |
| `.doc-layout` + `.toc#toc` + `.doc-content` | Two-column layout; TOC is auto-filled |
| `.doc-section[data-toc]` | A TOC-tracked section; put one `<h2>` inside |
| `.card-grid` + `.card` (with `<h4>` + `<p>`) | Overview / key-facts grid |
| `.callout note\|tip\|important\|warning\|deprecated` + `.callout-title` | Colored callout boxes |
| `.doc-table` | Styled table for API params, option matrices |
| `code` / `.ic` | Inline code reference (mono, accent color) |
| `<pre><code>…</code></pre>` | Code block — gets an automatic Copy button |
| `.references` | References block (combine with `.doc-section` so it lands in the TOC) |
| `.mermaid` / `.diagram` | Diagram container (see below) |

The renderer (`renderer.js`) handles TOC build, scroll-spy, anchor links, and copy buttons automatically on `DOMContentLoaded`. You're not limited to these classes — add your own inline `<style>`/`<script>`, SVGs, or widgets.

**Diagrams:** for static diagrams use inline SVG or ASCII art inside `<pre>`. For mermaid, the renderer calls `mermaid.initialize({theme:'dark'})` **if** `window.mermaid` exists — so opt in by adding the mermaid CDN `<script>` to your body and a `<div class="mermaid">…</div>`. Note this requires network access when the page opens; for fully-offline docs, prefer inline SVG.

## 5. Tone and content

Write reader-facing prose. Lead with the answer or the headline, then explain. Keep examples small and runnable. Cite source files with inline `code` references so readers can jump in. Keep callouts rare — overuse destroys signal.

## 6. Assemble and open

1. Write your body HTML to `/tmp/docs-canvas-body.html`.
2. Assemble with Python (reads `template.html`, `styles.css`, `renderer.js` from this skill directory):

```bash
python3 <<'PY'
from pathlib import Path
skill = Path("SKILL_DIR")  # absolute path to this skill directory
title = "Payments Service — Architecture"
body = Path("/tmp/docs-canvas-body.html").read_text()
css  = (skill / "styles.css").read_text()
js   = (skill / "renderer.js").read_text()
tmpl = (skill / "template.html").read_text()
out = (tmpl.replace("<!-- INJECT_TITLE -->", title)
           .replace("/* INJECT_CSS */", css)
           .replace("/* INJECT_JS */", js)
           .replace("<!-- INJECT_BODY -->", body))
Path("/tmp/docs-canvas.html").write_text(out)
print("wrote /tmp/docs-canvas.html")
PY
```

Replace `SKILL_DIR` with the real absolute path to this skill directory (resolve it from the plugin install location, e.g. via `${CLAUDE_PLUGIN_ROOT}` or by locating the skill in your environment).

3. Open the result:
   - Simplest (macOS): `open /tmp/docs-canvas.html`.
   - Or serve and open in a browser / browser MCP tool:
     ```bash
     cd /tmp && python3 -m http.server 8433 --bind 127.0.0.1
     ```
     Run it backgrounded, then open `http://127.0.0.1:8433/docs-canvas.html`. If a browser MCP is connected, navigate it there; otherwise hand the URL/file path to the user. (Fixed port + `cd /tmp` because background shells have no TTY and Python buffers its startup line; if 8433 is taken, try 8434, 8435, …)

## Be creative

The sections above are a floor, not a ceiling. Look at the source material in front of you and ask what representation would actually help the reader for *this* topic, then build it.
