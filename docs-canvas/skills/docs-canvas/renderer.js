/* docs-canvas renderer — dependency-free.
 * Auto-builds a table of contents from sections, adds anchor links,
 * scroll-spy highlighting, and copy buttons on code blocks.
 *
 * Expected body structure (the agent writes this):
 *   <div class="doc-header"><h1>Title</h1>...</div>
 *   <div class="doc-layout">
 *     <nav class="toc" id="toc"></nav>          <!-- filled automatically -->
 *     <main class="doc-content">
 *       <section class="doc-section" data-toc="Overview"> <h2>Overview</h2> ... </section>
 *       ...
 *     </main>
 *   </div>
 */

function slugify(s) {
  return (s || 'section')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'section';
}

function uniqueId(base, used) {
  var id = base, n = 2;
  while (used[id]) { id = base + '-' + n; n++; }
  used[id] = true;
  return id;
}

function addAnchor(heading) {
  if (heading.querySelector('.anchor')) return;
  // link to the nearest element with an id (the heading itself or its section)
  var target = heading.id ? heading : heading.closest('[id]');
  if (!target || !target.id) return;
  var a = document.createElement('a');
  a.className = 'anchor';
  a.href = '#' + target.id;
  a.setAttribute('aria-hidden', 'true');
  a.textContent = '#';
  heading.appendChild(a);
}

function buildToc() {
  var toc = document.getElementById('toc');
  var content = document.querySelector('.doc-content');
  if (!toc || !content) return [];

  var used = {};
  var sections = content.querySelectorAll('.doc-section');
  var entries = [];
  var frag = document.createDocumentFragment();

  var title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = 'On this page';
  frag.appendChild(title);

  sections.forEach(function (sec) {
    var h2 = sec.querySelector('h2');
    var label = sec.getAttribute('data-toc') || (h2 && h2.textContent) || 'Section';
    if (!sec.id) sec.id = uniqueId(slugify(label), used); else used[sec.id] = true;
    if (h2) addAnchor(h2);

    var link = document.createElement('a');
    link.href = '#' + sec.id;
    link.textContent = label;
    link.className = 'lvl-2';
    frag.appendChild(link);
    entries.push({ id: sec.id, link: link, el: sec });

    // Sub-headings (h3) that opt in via data-toc or by default
    sec.querySelectorAll('h3').forEach(function (h3) {
      if (h3.getAttribute('data-toc') === 'skip') return;
      if (!h3.id) h3.id = uniqueId(sec.id + '-' + slugify(h3.textContent), used); else used[h3.id] = true;
      addAnchor(h3);
      var sub = document.createElement('a');
      sub.href = '#' + h3.id;
      sub.textContent = h3.textContent.replace(/#$/, '').trim();
      sub.className = 'lvl-3';
      frag.appendChild(sub);
      entries.push({ id: h3.id, link: sub, el: h3 });
    });
  });

  toc.innerHTML = '';
  toc.appendChild(frag);
  return entries;
}

function setupScrollSpy(entries) {
  if (!entries.length || !('IntersectionObserver' in window)) return;
  var byId = {};
  entries.forEach(function (e) { byId[e.id] = e.link; });
  var visible = {};

  var obs = new IntersectionObserver(function (records) {
    records.forEach(function (r) {
      if (r.isIntersecting) visible[r.target.id] = r.intersectionRatio;
      else delete visible[r.target.id];
    });
    var bestId = null, best = -1;
    Object.keys(visible).forEach(function (id) {
      if (visible[id] > best) { best = visible[id]; bestId = id; }
    });
    if (!bestId) return;
    entries.forEach(function (e) { e.link.classList.remove('active'); });
    if (byId[bestId]) byId[bestId].classList.add('active');
  }, { rootMargin: '-10% 0px -70% 0px', threshold: [0, 0.25, 0.5, 1] });

  entries.forEach(function (e) { obs.observe(e.el); });
}

function setupCopyButtons() {
  document.querySelectorAll('pre').forEach(function (pre) {
    if (pre.querySelector('.copy-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre;
      var text = code.innerText.replace(/\n?Copy$/, '');
      var done = function () { btn.textContent = 'Copied'; btn.classList.add('copied'); setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
    pre.appendChild(btn);
  });
}

function initMermaid() {
  // Only runs if the agent opted in by including the mermaid CDN script.
  if (window.mermaid && typeof window.mermaid.initialize === 'function') {
    try { window.mermaid.initialize({ startOnLoad: true, theme: 'dark' }); } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var entries = buildToc();
  setupScrollSpy(entries);
  setupCopyButtons();
  initMermaid();
});
