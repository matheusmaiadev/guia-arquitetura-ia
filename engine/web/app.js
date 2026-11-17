(() => {
  "use strict";

  const STORAGE_KEY = "guia_arquitetura_ia_reader_v1";

  const SHADOW_READER_CSS = `
    :host {
      display: block;
      width: 100%;
      min-height: 100%;
      --reader-scale: 1;
    }

    .reader-stage {
      min-height: 100%;
      padding: 28px 24px 80px;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .reader-stage.sheet-paper {
      background: #e9eef5;
    }
    html-context-dark .reader-stage.sheet-paper {
      background: #181a1f;
    }
    .reader-stage.sheet-paper.on-dark-workbench {
      background: #17181c;
    }

    .reader-sheet {
      max-width: 900px;
      margin: 0 auto;
      font-family: var(--font-body);
      font-size: calc(15.2px * var(--reader-scale));
      line-height: 1.68;
      color: var(--color-body);
      background: var(--color-bg);
    }

    .reader-stage.sheet-paper .reader-sheet {
      padding: 40px 48px 56px;
      border-radius: 6px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.22);
      border: 1px solid #cbd5e1;
    }

    .reader-stage.sheet-seamless {
      background: var(--color-bg);
      padding: 28px 36px 84px;
    }

    .reader-stage.is-dark {
      --color-bg: #1f1f1f;
      --color-card-bg: #25262b;
      --color-ink: #f1f5f9;
      --color-body: #d4d4d8;
      --color-muted: #9ca3af;
      --color-subtle: #8b949e;

      --color-primary: #60a5fa;
      --color-primary-dark: #93c5fd;
      --color-primary-soft: rgba(59, 130, 246, 0.15);
      --color-primary-border: rgba(96, 165, 250, 0.38);

      --color-secondary: #cbd5e1;
      --color-secondary-soft: #2a2d34;

      --color-border: #373a40;
      --color-border-light: #2e3137;
      --color-surface: #25262b;
      --color-surface-alt: #2c2e33;

      --color-error-border: #f87171;
      --color-error-bg: rgba(239, 68, 68, 0.12);
      --color-error-ink: #fca5a5;

      --color-tip-border: #34d399;
      --color-tip-bg: rgba(16, 185, 129, 0.12);
      --color-tip-ink: #6ee7b7;

      --color-warn-border: #fbbf24;
      --color-warn-bg: rgba(245, 158, 11, 0.12);
      --color-warn-ink: #fde68a;

      --color-pron-border: #818cf8;
      --color-pron-bg: rgba(99, 102, 241, 0.14);
      --color-pron-ink: #c7d2fe;
    }

    .doc-general h1 {
      margin: 0 0 16px 0;
      padding-bottom: 10px;
      font-family: var(--font-heading);
      font-size: 1.72em;
      line-height: 1.25;
      color: var(--color-ink);
      border-bottom: 2px solid var(--color-primary);
    }

    h2 {
      font-size: 1.28em;
      margin-top: 28px;
      margin-bottom: 10px;
      scroll-margin-top: 18px;
    }

    h3 {
      font-size: 1.08em;
      margin-top: 20px;
      margin-bottom: 8px;
      scroll-margin-top: 18px;
    }

    p, li {
      font-size: 1em;
      line-height: 1.68;
    }

    .doc-content > table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px;
      font-size: 0.92em;
      display: block;
      overflow-x: auto;
    }

    .doc-content > table th,
    .doc-content > table td {
      border: 1px solid var(--color-border);
      padding: 8px 11px;
      text-align: left;
      vertical-align: top;
    }

    .doc-content > table th {
      background: var(--color-surface-alt);
      color: var(--color-ink);
      font-weight: 700;
    }

    .doc-content > table tr:nth-child(even) td {
      background: var(--color-surface);
    }

    pre {
      padding: 12px 14px;
      border-radius: 5px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-ink);
      overflow-x: auto;
      font-size: 0.88em;
      line-height: 1.5;
    }

    code {
      font-size: 0.88em;
      padding: 1px 5px;
      border-radius: 3px;
      background: var(--color-surface-alt);
      color: var(--color-ink);
    }

    pre code {
      padding: 0;
      background: transparent;
      border: none;
      color: inherit;
    }

    blockquote {
      margin: 14px 0;
      padding: 10px 14px;
      border-left: 3px solid var(--color-primary);
      background: var(--color-surface);
      color: var(--color-body);
      border-radius: 0 4px 4px 0;
    }

    details {
      margin: 14px 0;
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background: var(--color-surface);
    }

    summary {
      cursor: pointer;
      font-weight: 600;
      color: var(--color-primary);
    }

    a {
      color: var(--color-primary);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    .diagram-container {
      padding: 0 0 16px 0;
      margin: 18px 0;
      border: 1px solid var(--color-border);
      border-top: 3px solid var(--color-primary);
      border-radius: 6px;
      overflow-x: auto;
      text-align: center;
      font-size: 13px !important;
      line-height: 1.3 !important;
    }

    .diagram-header,
    .ascii-diagram-header,
    .code-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      font-family: var(--font-heading);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: var(--color-surface-alt);
      color: var(--color-muted);
      border-bottom: 1px solid var(--color-border-light);
      text-align: left;
    }

    .diagram-container pre.mermaid {
      padding: 16px 14px 4px 14px;
      margin: 0;
      background: transparent;
      border: 0;
    }

    .diagram-container svg {
      max-width: 100%;
      height: auto;
      font-size: 13px !important;
      line-height: 1.3 !important;
    }

    .diagram-container foreignObject {
      overflow: visible !important;
    }

    .diagram-container p,
    .diagram-container .nodeLabel p,
    .diagram-container .edgeLabel p,
    .diagram-container foreignObject div,
    .diagram-container foreignObject span {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 13px !important;
      line-height: 1.3 !important;
    }

    .ascii-diagram {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-top: 3px solid var(--color-primary);
      border-radius: 6px;
      margin: 16px 0;
      overflow-x: auto;
    }

    .ascii-diagram.is-tree {
      border-top-color: #14b8a6;
    }

    .ascii-diagram pre.ascii-diagram-body {
      margin: 0;
      padding: 14px 18px;
      background: transparent;
      color: var(--color-ink);
      border: 0;
      border-radius: 0;
      font-family: var(--font-mono);
      font-size: 12.8px;
      line-height: 1.18;
      white-space: pre;
      word-break: normal;
      overflow-x: auto;
    }

    .ascii-diagram pre.ascii-diagram-body .ascii-box-ch {
      color: var(--color-muted);
    }

    .ascii-diagram pre.ascii-diagram-body .ascii-arrow-ch {
      color: var(--color-primary);
      font-weight: 700;
    }

    .ascii-diagram pre.ascii-diagram-body .ascii-shade-ch {
      color: var(--color-primary);
    }

    .ascii-diagram pre.ascii-diagram-body .ascii-comment {
      color: #14b8a6;
      font-style: italic;
    }

    .code-block-card {
      border: 1px solid var(--color-border);
      border-radius: 6px;
      margin: 16px 0;
      overflow: hidden;
      background: #0f172a;
    }

    .code-block-card .code-block-header {
      background: #1e293b;
      color: #94a3b8;
      border-bottom: 1px solid #334155;
      padding: 5px 14px;
    }

    .code-lang-tag {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: #60a5fa;
      letter-spacing: 0.06em;
    }

    .code-block-card pre {
      margin: 0;
      border: 0;
      border-radius: 0;
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 16px;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
    }

    @media (max-width: 720px) {
      .reader-stage,
      .reader-stage.sheet-seamless {
        padding: 18px 14px 64px;
      }
      .reader-stage.sheet-paper .reader-sheet {
        padding: 22px 18px 40px;
      }
    }
  `;

  const state = {
    manifest: null,
    editorialCss: "",
    searchCorpus: null,
    docCache: new Map(),
    scriptPromises: new Map(),

    workbenchTheme: "dark",
    sheetMode: "auto",
    readerScale: 1.0,
    sidebarView: "explorer",
    sidebarCollapsed: false,
    expandedDirs: new Set([
      "00-cadernos-pdf",
      "01-fundamentos",
      "02-orquestracao",
      "02-orquestracao/07-padroes-execucao",
      "02-orquestracao/08-estudos-de-caso",
      "03-rag-dados",
      "04-infraestrutura",
      "05-governanca-seguranca",
      "06-adocao-empresa",
      "repos",
    ]),

    panes: [
      { tabs: [], activePath: null },
      { tabs: [], activePath: null },
    ],
    splitActive: false,
    focusedPane: 0,
    paneControllers: [null, null],
    lastPdfPages: {},

    paletteFiltered: [],
    paletteIndex: 0,
    mermaidCounter: 0,
    suppressHashEvent: false,
  };

  const dom = {
    html: document.documentElement,
    sidebar: document.getElementById("sidebar"),
    sidebarBackdrop: document.getElementById("sidebar-backdrop"),
    sidebarResizer: document.getElementById("sidebar-resizer"),
    fileTree: document.getElementById("file-tree"),
    outlineList: document.getElementById("outline-list"),
    outlineSection: document.getElementById("outline-section"),
    searchInput: document.getElementById("search-input"),
    searchSummary: document.getElementById("search-summary"),
    searchResults: document.getElementById("search-results"),
    catalogContainer: document.getElementById("catalog-container"),

    pane0: document.getElementById("pane-0"),
    pane1: document.getElementById("pane-1"),
    paneResizer: document.getElementById("pane-resizer"),
    tabs: [document.getElementById("tabs-0"), document.getElementById("tabs-1")],
    actions: [document.getElementById("actions-0"), document.getElementById("actions-1")],
    breadcrumbs: [document.getElementById("breadcrumbs-0"), document.getElementById("breadcrumbs-1")],
    viewports: [document.getElementById("viewport-0"), document.getElementById("viewport-1")],

    statusContextBtn: document.getElementById("btn-status-context"),
    statusContextLabel: document.getElementById("status-context-label"),
    statusDocMeta: document.getElementById("status-doc-meta"),
    statusZoomMeta: document.getElementById("status-zoom-meta"),
    commandCenterLabel: document.getElementById("command-center-label"),

    paletteBackdrop: document.getElementById("palette-backdrop"),
    paletteInput: document.getElementById("palette-input"),
    paletteList: document.getElementById("palette-list"),
  };

  function loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.workbenchTheme === "light" || saved.workbenchTheme === "dark") {
        state.workbenchTheme = saved.workbenchTheme;
      }
      if (saved.sheetMode === "auto" || saved.sheetMode === "paper") {
        state.sheetMode = saved.sheetMode;
      }
      if (typeof saved.readerScale === "number") {
        state.readerScale = Math.min(1.35, Math.max(0.85, saved.readerScale));
      }
      if (Array.isArray(saved.expandedDirs) && saved.expandedDirs.length > 0) {
        state.expandedDirs = new Set(saved.expandedDirs);
      }
      if (saved.lastPdfPages && typeof saved.lastPdfPages === "object") {
        state.lastPdfPages = saved.lastPdfPages;
      }
    } catch (_) {}
  }

  function persistState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          workbenchTheme: state.workbenchTheme,
          sheetMode: state.sheetMode,
          readerScale: state.readerScale,
          expandedDirs: Array.from(state.expandedDirs),
          lastPdfPages: state.lastPdfPages,
        })
      );
    } catch (_) {}
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadScriptOnce(src) {
    if (state.scriptPromises.has(src)) {
      return state.scriptPromises.get(src);
    }
    const promise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
      document.head.appendChild(s);
    });
    state.scriptPromises.set(src, promise);
    return promise;
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 860px)").matches;
  }

  function fileBadgeHtml(type) {
    if (type === "pdf") {
      return '<span class="file-badge-icon file-badge-pdf" aria-hidden="true">PDF</span>';
    }
    if (type === "repo") {
      return '<span class="file-badge-icon" style="color:#a78bfa" aria-hidden="true">GIT</span>';
    }
    return '<span class="file-badge-icon file-badge-md" aria-hidden="true">M↓</span>';
  }

  function normalizeDocPath(rawPath) {
    if (!rawPath || !state.manifest) return rawPath;
    if (state.manifest.items[rawPath]) return rawPath;
    return state.manifest.aliases?.[rawPath] || rawPath;
  }

  async function fetchDocPayload(path) {
    if (state.docCache.has(path)) {
      return state.docCache.get(path);
    }
    const item = state.manifest.items[path];
    if (!item || !item.docId) {
      throw new Error(`Documento não encontrado: ${path}`);
    }
    const resp = await fetch(`./data/docs/${encodeURIComponent(item.docId)}.json`);
    if (!resp.ok) {
      throw new Error(`Erro HTTP ${resp.status} ao abrir ${path}`);
    }
    const data = await resp.json();
    state.docCache.set(path, data);
    return data;
  }

  async function ensureSearchCorpus() {
    if (state.searchCorpus) return state.searchCorpus;
    const resp = await fetch("./data/search.json");
    state.searchCorpus = resp.ok ? await resp.json() : [];
    return state.searchCorpus;
  }

  function applyWorkbenchTheme() {
    dom.html.setAttribute("data-workbench-theme", state.workbenchTheme);
    persistState();
    refreshAllPanesAppearance();
  }

  function toggleWorkbenchTheme() {
    state.workbenchTheme = state.workbenchTheme === "dark" ? "light" : "dark";
    applyWorkbenchTheme();
  }

  function setSidebarView(viewName) {
    if (state.sidebarView === viewName && !state.sidebarCollapsed) {
      toggleSidebar(true);
      return;
    }
    state.sidebarView = viewName;
    toggleSidebar(false);

    document.querySelectorAll(".activity-btn[data-view]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.view === viewName);
    });
    document.getElementById("view-explorer").hidden = viewName !== "explorer";
    document.getElementById("view-search").hidden = viewName !== "search";
    document.getElementById("view-catalog").hidden = viewName !== "catalog";

    if (viewName === "search") {
      setTimeout(() => dom.searchInput.focus(), 30);
      ensureSearchCorpus();
    }
  }

  function toggleSidebar(forceCollapse) {
    state.sidebarCollapsed =
      typeof forceCollapse === "boolean" ? forceCollapse : !state.sidebarCollapsed;
    dom.sidebar.classList.toggle("is-collapsed", state.sidebarCollapsed);
    if (isMobileViewport()) {
      dom.sidebarBackdrop.hidden = state.sidebarCollapsed;
    } else {
      dom.sidebarBackdrop.hidden = true;
    }
  }

  function renderFileTree() {
    if (!state.manifest) return;
    const activeFocusedPath = state.panes[state.focusedPane].activePath;
    const htmlParts = [];

    function walk(nodes, depth) {
      for (const node of nodes) {
        const padLeft = 12 + depth * 13;
        if (node.kind === "dir") {
          const isExpanded = state.expandedDirs.has(node.path);
          const isReposRoot = depth === 0 && node.name === "repos";
          htmlParts.push(
            `<div class="tree-row ${isExpanded ? "is-expanded" : ""}" ` +
              `style="padding-left:${padLeft}px" data-dir-path="${escapeHtml(node.path)}" role="treeitem" aria-expanded="${isExpanded}">` +
              `<svg class="chevron-icon" viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M6 4l4 4-4 4V4z"/></svg>` +
              `<svg class="folder-glyph" viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M1.5 2h4.8l1.2 1.5h7a.5.5 0 0 1 .5.5v9.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5z"/></svg>` +
              `<span class="tree-label">${escapeHtml(node.name)}</span>` +
              (isReposRoot ? `<span class="tree-badge" title="Pasta guarda-chuva para submódulos Git">submodules</span>` : "") +
              `</div>`
          );
          if (isExpanded && node.children && node.children.length > 0) {
            walk(node.children, depth + 1);
          }
        } else {
          const isActive = node.path === activeFocusedPath;
          const filePadLeft = depth === 0 ? 14 : padLeft + 16;
          htmlParts.push(
            `<div class="tree-row ${isActive ? "is-active" : ""}" ` +
              `style="padding-left:${filePadLeft}px" data-file-path="${escapeHtml(node.path)}" ` +
              `title="${escapeHtml(node.title || node.path)}" role="treeitem">` +
              `${fileBadgeHtml(node.type)}` +
              `<span class="tree-label">${escapeHtml(node.name)}</span>` +
              (node.pairedPdf
                ? `<button class="tree-quick-pdf" data-open-pdf="${escapeHtml(node.pairedPdf)}" title="Abrir versão PDF">PDF</button>`
                : "") +
              `</div>`
          );
        }
      }
    }

    walk(state.manifest.tree, 0);
    dom.fileTree.innerHTML = htmlParts.join("");
  }

  function expandParentsOf(filePath) {
    const parts = filePath.split("/");
    let acc = "";
    for (let i = 0; i < parts.length - 1; i++) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i];
      state.expandedDirs.add(acc);
    }
    persistState();
  }

  function renderOutline(outlineItems, paneIdx) {
    if (paneIdx !== state.focusedPane) return;
    if (!outlineItems || outlineItems.length === 0) {
      dom.outlineList.innerHTML =
        '<div class="sidebar-empty-hint">Sem seções disponíveis para este arquivo.</div>';
      return;
    }
    dom.outlineList.innerHTML = outlineItems
      .map(
        (h) =>
          `<div class="outline-item level-${h.level}" data-heading-id="${escapeHtml(h.id)}" title="${escapeHtml(h.text)}">` +
          `<span class="outline-symbol">H${h.level}</span>` +
          `<span>${escapeHtml(h.text)}</span>` +
          `</div>`
      )
      .join("");
  }

  function renderCatalogView() {
    if (!state.manifest || !state.manifest.catalog) return;
    const cat = state.manifest.catalog;
    const chunks = [];

    const pills = [
      `<button class="catalog-pill-btn" data-doc-open="README.md">Índice Geral</button>`,
    ];
    if (cat.reposReadmePath) {
      pills.push(
        `<button class="catalog-pill-btn" data-doc-open="${escapeHtml(cat.reposReadmePath)}">Guia repos/ (Submodules)</button>`
      );
    }
    chunks.push(`<div class="catalog-ref-pills">${pills.join("")}</div>`);

    // 1. Umbrella Repositories (repos/)
    if (cat.repositories && cat.repositories.length > 0) {
      chunks.push(`<div class="catalog-block-title">Ecossistema Guarda-Chuva (repos/)</div>`);
      for (const repo of cat.repositories) {
        const statusLabel =
          repo.status === "submodule"
            ? "Submódulo Ativo"
            : repo.status === "linked"
            ? "Publicado"
            : "Planejado";
        chunks.push(
          `<div class="roadmap-card">` +
            `<div class="roadmap-card-head">` +
            `<span class="roadmap-card-title">${escapeHtml(repo.name)}</span>` +
            `<span class="roadmap-card-level">${escapeHtml(statusLabel)}</span>` +
            `</div>` +
            `<p class="roadmap-card-sub"><code>repos/${escapeHtml(repo.id)}</code> — ${escapeHtml(repo.description)}</p>` +
            `<div class="roadmap-card-actions">` +
            (repo.localReadme
              ? `<button class="mini-action-btn" data-doc-open="${escapeHtml(repo.localReadme)}">Abrir Submódulo</button>`
              : "") +
            (repo.relatedDoc
              ? `<button class="mini-action-btn is-secondary" data-doc-open="${escapeHtml(repo.relatedDoc)}">Ver Base Teórica</button>`
              : "") +
            (repo.githubUrl
              ? `<a class="mini-action-btn is-secondary" href="${escapeHtml(repo.githubUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">GitHub ↗</a>`
              : "") +
            `</div>` +
            `</div>`
        );
      }
    }

    // 2. Study Modules (01..06) + Module PDF Notebooks
    if (cat.modules && cat.modules.length > 0) {
      chunks.push(`<div class="catalog-block-title">Trilha de Arquitetura de IA (Módulos 01–06)</div>`);
      for (const mod of cat.modules) {
        const rows = (mod.docs || [])
          .map(
            (doc) =>
              `<div class="catalog-unit-row is-available" data-doc-open="${escapeHtml(doc.path)}">` +
              `<span class="catalog-unit-code">${escapeHtml(doc.code)}</span>` +
              `<span class="catalog-unit-name">${escapeHtml(doc.title)}</span>` +
              (doc.pdfPath
                ? `<button class="tree-quick-pdf" style="opacity:1" data-open-pdf="${escapeHtml(doc.pdfPath)}" title="Abrir PDF do capítulo">PDF</button>`
                : "") +
              `</div>`
          )
          .join("");

        const notebookBtn = mod.notebookPdfPath
          ? `<div style="padding:6px 9px;border-top:1px solid var(--vscode-border-subtle);display:flex;justify-content:flex-end;">` +
            `<button class="mini-action-btn" data-doc-open="${escapeHtml(mod.notebookPdfPath)}">Abrir Caderno Completo do Módulo (PDF)</button>` +
            `</div>`
          : "";

        chunks.push(
          `<details class="catalog-area-details" open>` +
            `<summary>${escapeHtml(mod.title)}</summary>` +
            `${notebookBtn}${rows}` +
            `</details>`
        );
      }
    }

    dom.catalogContainer.innerHTML = chunks.join("");
  }

  async function runGlobalSearch(rawQuery) {
    const q = rawQuery.trim();
    if (q.length < 2) {
      dom.searchSummary.textContent = "Digite pelo menos 2 caracteres para pesquisar.";
      dom.searchResults.innerHTML = "";
      return;
    }

    const corpus = await ensureSearchCorpus();
    const qLower = q.toLowerCase();
    const groups = [];
    let totalMatches = 0;

    for (const entry of corpus) {
      const matches = [];
      if (entry.title.toLowerCase().includes(qLower)) {
        matches.push({ snippet: entry.title, isTitle: true });
      }

      const textLower = entry.text.toLowerCase();
      let pos = 0;
      while (matches.length < 4) {
        const idx = textLower.indexOf(qLower, pos);
        if (idx === -1) break;
        const start = Math.max(0, idx - 42);
        const end = Math.min(entry.text.length, idx + q.length + 58);
        const prefix = start > 0 ? "…" : "";
        const suffix = end < entry.text.length ? "…" : "";
        const before = escapeHtml(entry.text.slice(start, idx));
        const hit = escapeHtml(entry.text.slice(idx, idx + q.length));
        const after = escapeHtml(entry.text.slice(idx + q.length, end));
        matches.push({ snippetHtml: `${prefix}${before}<mark>${hit}</mark>${after}${suffix}` });
        pos = idx + q.length + 25;
      }

      if (matches.length > 0) {
        totalMatches += matches.length;
        groups.push({ entry, matches });
      }
    }

    dom.searchSummary.textContent =
      groups.length === 0
        ? `Nenhum resultado para "${q}".`
        : `${totalMatches} resultado(s) em ${groups.length} arquivo(s)`;

    dom.searchResults.innerHTML = groups
      .map(({ entry, matches }) => {
        const fileName = entry.path.split("/").pop();
        const itemsHtml = matches
          .map((m) => {
            if (m.isTitle) {
              const idx = m.snippet.toLowerCase().indexOf(qLower);
              const hi =
                escapeHtml(m.snippet.slice(0, idx)) +
                `<mark>${escapeHtml(m.snippet.slice(idx, idx + q.length))}</mark>` +
                escapeHtml(m.snippet.slice(idx + q.length));
              return `<div class="search-match-item" data-doc-open="${escapeHtml(entry.path)}"><strong>Título:</strong> ${hi}</div>`;
            }
            return `<div class="search-match-item" data-doc-open="${escapeHtml(entry.path)}">${m.snippetHtml}</div>`;
          })
          .join("");
        return (
          `<div class="search-group">` +
          `<div class="search-group-header" data-doc-open="${escapeHtml(entry.path)}" title="${escapeHtml(entry.path)}">` +
          `${fileBadgeHtml(entry.type)}` +
          `<span>${escapeHtml(fileName)}</span>` +
          `</div>` +
          `${itemsHtml}` +
          `</div>`
        );
      })
      .join("");
  }

  function setFocusedPane(paneIdx) {
    if (paneIdx === 1 && !state.splitActive) return;
    state.focusedPane = paneIdx;
    dom.pane0.classList.toggle("is-focused", paneIdx === 0);
    dom.pane1.classList.toggle("is-focused", paneIdx === 1);
    renderFileTree();
    syncFocusedOutlineAndStatus();
  }

  function syncUrlHash() {
    const activePath = state.panes[state.focusedPane].activePath || state.panes[0].activePath;
    const nextHash = activePath ? `#/${activePath}` : "#/";
    if (window.location.hash !== nextHash) {
      state.suppressHashEvent = true;
      history.replaceState(null, "", nextHash);
      setTimeout(() => {
        state.suppressHashEvent = false;
      }, 0);
    }
  }

  async function openDocument(rawPath, options = {}) {
    const path = normalizeDocPath(rawPath);
    if (!state.manifest || !state.manifest.items[path]) return;

    const {
      paneIdx = state.focusedPane,
      pinned = false,
      anchor = "",
      closeMobileDrawer = true,
    } = options;

    let targetPane = paneIdx;
    if (targetPane === 1 && !state.splitActive) {
      enableSplitPane();
    }

    const item = state.manifest.items[path];
    if (!item.hiddenFromTree) {
      expandParentsOf(path);
    }

    const pane = state.panes[targetPane];
    const existing = pane.tabs.find((t) => t.path === path);
    if (existing) {
      if (pinned) existing.pinned = true;
    } else {
      const previewIdx = pane.tabs.findIndex((t) => !t.pinned);
      const newTab = { path, pinned };
      if (!pinned && previewIdx !== -1) {
        pane.tabs.splice(previewIdx, 1, newTab);
      } else {
        pane.tabs.push(newTab);
      }
    }

    const switchedFile = pane.activePath !== path;
    pane.activePath = path;
    state.focusedPane = targetPane;

    if (closeMobileDrawer && isMobileViewport()) {
      toggleSidebar(true);
    }

    renderPaneTabs(targetPane);
    renderPaneActions(targetPane);
    renderBreadcrumbs(targetPane);
    renderFileTree();
    syncUrlHash();

    if (switchedFile || !state.paneControllers[targetPane]) {
      await renderPaneViewport(targetPane, { anchor });
    } else if (anchor && state.paneControllers[targetPane]?.scrollToAnchor) {
      state.paneControllers[targetPane].scrollToAnchor(anchor);
    }

    updateStatusBar();
  }

  function closeTab(paneIdx, path) {
    const pane = state.panes[paneIdx];
    const idx = pane.tabs.findIndex((t) => t.path === path);
    if (idx === -1) return;

    const wasActive = pane.activePath === path;
    pane.tabs.splice(idx, 1);

    if (paneIdx === 1 && pane.tabs.length === 0) {
      disableSplitPane();
      return;
    }

    if (wasActive) {
      const fallback = pane.tabs[Math.min(idx, pane.tabs.length - 1)];
      pane.activePath = fallback ? fallback.path : null;
      renderPaneViewport(paneIdx);
    }

    renderPaneTabs(paneIdx);
    renderPaneActions(paneIdx);
    renderBreadcrumbs(paneIdx);
    renderFileTree();
    syncUrlHash();
    updateStatusBar();
  }

  function enableSplitPane() {
    if (state.splitActive) return;
    state.splitActive = true;
    dom.pane1.hidden = false;
    dom.paneResizer.hidden = false;
    document.getElementById("btn-toggle-split").classList.add("is-active");
  }

  function disableSplitPane() {
    destroyPaneController(1);
    state.splitActive = false;
    state.panes[1] = { tabs: [], activePath: null };
    state.focusedPane = 0;
    dom.pane1.hidden = true;
    dom.paneResizer.hidden = true;
    dom.pane0.style.flex = "1";
    dom.pane1.style.flex = "1";
    document.getElementById("btn-toggle-split").classList.remove("is-active");
    renderPaneActions(0);
    renderFileTree();
    syncFocusedOutlineAndStatus();
  }

  function toggleSplitReading() {
    if (state.splitActive) {
      disableSplitPane();
      return;
    }
    const active0 = state.panes[0].activePath || "README.md";
    const item0 = state.manifest.items[active0];
    const pairedPdf = item0?.pairedPdf || null;
    const pairedMd = item0?.sourceMd || null;
    const targetForRight = pairedPdf || pairedMd || active0;
    enableSplitPane();
    openDocument(targetForRight, { paneIdx: 1, pinned: true });
  }

  function renderPaneTabs(paneIdx) {
    const pane = state.panes[paneIdx];
    const strip = dom.tabs[paneIdx];
    strip.innerHTML = pane.tabs
      .map((t) => {
        const item = state.manifest.items[t.path] || {};
        const name = t.path.split("/").pop();
        const isActive = t.path === pane.activePath;
        return (
          `<div class="tab-item ${isActive ? "is-active" : ""} ${!t.pinned ? "is-preview" : ""}" ` +
          `data-tab-path="${escapeHtml(t.path)}" data-pane="${paneIdx}" title="${escapeHtml(item.title || t.path)}" role="tab" aria-selected="${isActive}">` +
          `${fileBadgeHtml(item.type || "md")}` +
          `<span class="tab-title">${escapeHtml(name)}</span>` +
          `<button class="tab-close-btn" data-close-tab="${escapeHtml(t.path)}" data-pane="${paneIdx}" title="Fechar aba" aria-label="Fechar aba">×</button>` +
          `</div>`
        );
      })
      .join("");

    const activeEl = strip.querySelector(".tab-item.is-active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function renderPaneActions(paneIdx) {
    const pane = state.panes[paneIdx];
    const container = dom.actions[paneIdx];
    if (!pane.activePath) {
      container.innerHTML = "";
      return;
    }

    const item = state.manifest.items[pane.activePath];
    if (!item) {
      container.innerHTML = "";
      return;
    }

    const buttons = [];

    if (item.type === "md") {
      const pairedPdf = item.pairedPdf;
      if (pairedPdf) {
        buttons.push(
          `<button class="toolbar-pill-btn is-accent" data-action="open-paired-pdf" data-target="${escapeHtml(pairedPdf)}" data-pane="${paneIdx}" title="Abrir apostila PDF deste capítulo">` +
            `<span>PDF</span>` +
            `</button>`
        );
        if (!isMobileViewport()) {
          buttons.push(
            `<button class="toolbar-pill-btn" data-action="split-paired-pdf" data-target="${escapeHtml(pairedPdf)}" title="Ler .md e .pdf lado a lado">` +
              `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M2 2h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm5.5 1H2v10h5.5V3zm1 0v10H14V3H8.5z"/></svg>` +
              `<span>Lado a Lado</span>` +
              `</button>`
          );
        }
      }

      if (state.workbenchTheme === "dark") {
        const isPaper = state.sheetMode === "paper";
        buttons.push(
          `<button class="toolbar-pill-btn" data-action="toggle-sheet-mode" title="Alternar aparência da folha (Escura vs Papel Editorial)">` +
            `<span>${isPaper ? "Folha: Papel" : "Folha: Escura"}</span>` +
            `</button>`
        );
      }

      buttons.push(
        `<button class="toolbar-pill-btn" data-action="font-dec" title="Diminuir tamanho do texto">A−</button>`,
        `<button class="toolbar-pill-btn" data-action="font-inc" title="Aumentar tamanho do texto">A+</button>`
      );
    } else if (item.type === "pdf" && item.sourceMd) {
      buttons.push(
        `<button class="toolbar-pill-btn" data-action="open-paired-md" data-target="${escapeHtml(item.sourceMd)}" data-pane="${paneIdx}" title="Abrir versão em documento Markdown (.md)">` +
          `<span>M↓ Abrir .md</span>` +
          `</button>`
      );
    }

    if (paneIdx === 1 && state.splitActive) {
      buttons.push(
        `<button class="toolbar-pill-btn" data-action="close-split" title="Fechar painel dividido">✕</button>`
      );
    }

    container.innerHTML = buttons.join("");
  }

  function renderBreadcrumbs(paneIdx, activeSectionText = "") {
    const pane = state.panes[paneIdx];
    const bar = dom.breadcrumbs[paneIdx];
    if (!pane.activePath) {
      bar.innerHTML = "";
      return;
    }

    const parts = pane.activePath.split("/");
    const crumbs = parts.map((seg, i) => {
      const isLast = i === parts.length - 1 && !activeSectionText;
      return `<span class="${isLast ? "crumb-current" : ""}">${escapeHtml(seg)}</span>`;
    });

    if (activeSectionText) {
      crumbs.push(`<span class="crumb-current">${escapeHtml(activeSectionText)}</span>`);
    }

    bar.innerHTML = crumbs.join('<span class="crumb-sep">›</span>');
  }

  function destroyPaneController(paneIdx) {
    const ctrl = state.paneControllers[paneIdx];
    if (ctrl && typeof ctrl.destroy === "function") {
      ctrl.destroy();
    }
    state.paneControllers[paneIdx] = null;
  }

  function renderEmptyWatermark(viewport) {
    viewport.innerHTML = `
      <div class="empty-watermark">
        <svg class="watermark-logo" viewBox="0 0 24 24" width="72" height="72" fill="none" aria-hidden="true">
          <rect x="3.5" y="4.5" width="10" height="10" rx="2.8" stroke="currentColor" stroke-width="1.5"/>
          <rect x="10.5" y="9.5" width="10" height="10" rx="2.8" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="1.75" fill="currentColor"/>
        </svg>
        <h2 class="watermark-title">Guia de Arquitetura de IA</h2>
        <p class="watermark-sub">Trilha técnica de LLMs, Orquestração, RAG, Infraestrutura e Governança + Apostilas <code>.pdf</code> e Ecossistema Guarda-Chuva em <code>repos/</code>.</p>
        <div class="watermark-shortcuts">
          <div class="watermark-shortcut-row"><span>Ir rapidamente para capítulo ou PDF</span><kbd>⌘P / Ctrl+P</kbd></div>
          <div class="watermark-shortcut-row"><span>Pesquisar em todo o material</span><kbd>⌘⇧F / Ctrl+Shift+F</kbd></div>
          <div class="watermark-shortcut-row"><span>Dividir leitura (.md + .pdf) lado a lado</span><kbd>⌘\\ / Ctrl+\\</kbd></div>
        </div>
      </div>
    `;
  }

  async function renderPaneViewport(paneIdx, opts = {}) {
    const viewport = dom.viewports[paneIdx];
    const activePath = state.panes[paneIdx].activePath;

    const prevScrollTop = opts.preserveScroll
      ? viewport.querySelector(".md-scroll-host")?.scrollTop || 0
      : 0;

    destroyPaneController(paneIdx);

    if (!activePath) {
      renderEmptyWatermark(viewport);
      if (paneIdx === state.focusedPane) {
        dom.outlineList.innerHTML =
          '<div class="sidebar-empty-hint">Abra um documento .md para navegar pelas seções.</div>';
      }
      return;
    }

    const item = state.manifest.items[activePath];
    if (!item) return;

    if (item.type === "pdf") {
      await mountPdfReader(paneIdx, viewport, item);
    } else {
      await mountMarkdownReader(paneIdx, viewport, item, {
        anchor: opts.anchor || "",
        restoreScrollTop: prevScrollTop,
      });
    }
  }

  async function renderMermaidDiagramsInShadow(shadowRoot, useDarkDiagram) {
    const preNodes = Array.from(shadowRoot.querySelectorAll("pre.mermaid"));
    if (preNodes.length === 0) return;

    try {
      await loadScriptOnce(state.manifest.vendor.mermaidJs);
      if (!window.mermaid) return;

      window.mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        flowchart: { htmlLabels: true, curve: "basis", padding: 14, nodeSpacing: 28, rankSpacing: 34 },
        themeVariables: useDarkDiagram
          ? {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: "13px",
              primaryColor: "#1e293b",
              primaryTextColor: "#f1f5f9",
              primaryBorderColor: "#60a5fa",
              lineColor: "#60a5fa",
              edgeLabelBackground: "#25262b",
              secondaryColor: "#25262b",
              tertiaryColor: "#1f1f1f",
            }
          : {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: "13px",
              primaryColor: "#eff6ff",
              primaryTextColor: "#0f172a",
              primaryBorderColor: "#1e40af",
              lineColor: "#1e40af",
              edgeLabelBackground: "#ffffff",
              secondaryColor: "#ffffff",
              tertiaryColor: "#f8fafc",
            },
      });

      for (const pre of preNodes) {
        const rawText = pre.dataset.rawGraph || pre.textContent.trim();
        const graphCode = rawText.replace(/\\n/g, "<br/>");
        pre.dataset.rawGraph = graphCode;
        state.mermaidCounter += 1;
        const svgId = `mmd-svg-${state.mermaidCounter}`;
        const { svg } = await window.mermaid.render(svgId, graphCode);
        const wrapper = pre.parentElement;
        if (wrapper) {
          wrapper.innerHTML = svg;
          wrapper.dataset.rawGraph = graphCode;
        }
      }
    } catch (err) {
      console.warn("Aviso ao renderizar diagrama Mermaid:", err);
    }
  }

  async function mountMarkdownReader(paneIdx, viewport, item, { anchor, restoreScrollTop }) {
    viewport.innerHTML = `<div class="pdf-loading-msg">Carregando capítulo...</div>`;
    let payload;
    try {
      payload = await fetchDocPayload(item.path);
    } catch (err) {
      viewport.innerHTML = `<div class="pdf-loading-msg">${escapeHtml(err.message)}</div>`;
      return;
    }

    if (state.panes[paneIdx].activePath !== item.path) return;

    const htmlContent = payload.html || "";
    const outline = payload.outline || [];

    const scrollHost = document.createElement("div");
    scrollHost.className = "md-scroll-host";
    const shadowHost = document.createElement("div");
    scrollHost.appendChild(shadowHost);
    viewport.innerHTML = "";
    viewport.appendChild(scrollHost);

    const shadow = shadowHost.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = `${state.editorialCss}\n${SHADOW_READER_CSS}`;

    const stageEl = document.createElement("div");
    const sheetEl = document.createElement("div");
    sheetEl.className = "reader-sheet";
    sheetEl.innerHTML = htmlContent;
    stageEl.appendChild(sheetEl);

    shadow.appendChild(styleEl);
    shadow.appendChild(stageEl);

    function computeSheetDarkState() {
      const isDarkSheet = state.workbenchTheme === "dark" && state.sheetMode !== "paper";
      const isPaper = state.sheetMode === "paper" || state.workbenchTheme === "light";
      stageEl.className = [
        "reader-stage",
        isDarkSheet ? "is-dark sheet-seamless" : "sheet-paper",
        state.workbenchTheme === "dark" && isPaper ? "on-dark-workbench" : "",
      ]
        .filter(Boolean)
        .join(" ");
      shadowHost.style.setProperty("--reader-scale", String(state.readerScale));
      return isDarkSheet;
    }

    const isDarkSheet = computeSheetDarkState();
    await renderMermaidDiagramsInShadow(shadow, isDarkSheet);

    function scrollToHeading(targetId) {
      if (!targetId) return;
      const target = shadow.getElementById(targetId);
      if (!target) return;
      const parentDetails = target.closest("details");
      if (parentDetails) parentDetails.open = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    shadow.addEventListener("click", (ev) => {
      const link = ev.target.closest("a");
      if (!link) return;

      if (link.dataset.nonDoc === "true") {
        ev.preventDefault();
        return;
      }

      if (link.dataset.anchorLink) {
        ev.preventDefault();
        scrollToHeading(link.dataset.anchorLink);
        return;
      }

      if (link.dataset.docLink) {
        ev.preventDefault();
        const targetDoc = link.dataset.docLink;
        const targetAnchor = link.dataset.docAnchor || "";
        const openSide = ev.metaKey || ev.ctrlKey;
        openDocument(targetDoc, {
          paneIdx: openSide ? 1 : paneIdx,
          pinned: true,
          anchor: targetAnchor,
        });
      }
    });

    const headingEls = outline
      .map((h) => ({ meta: h, el: shadow.getElementById(h.id) }))
      .filter((x) => Boolean(x.el));

    let scrollTicking = false;
    scrollHost.addEventListener("scroll", () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        scrollTicking = false;
        const threshold = scrollHost.scrollTop + 80;
        let currentHeading = "";
        for (const h of headingEls) {
          if (h.el.offsetTop <= threshold) {
            currentHeading = h.meta.text;
          } else {
            break;
          }
        }
        renderBreadcrumbs(paneIdx, currentHeading);
      });
    });

    if (anchor) {
      setTimeout(() => scrollToHeading(anchor), 30);
    } else if (restoreScrollTop > 0) {
      scrollHost.scrollTop = restoreScrollTop;
    }

    state.paneControllers[paneIdx] = {
      type: "md",
      outline,
      scrollToAnchor: scrollToHeading,
      refreshAppearance: async () => {
        const nowDark = computeSheetDarkState();
        const diagramWrappers = Array.from(
          shadow.querySelectorAll(".diagram-svg-stage[data-raw-graph], .diagram-container[data-raw-graph]")
        );
        for (const w of diagramWrappers) {
          const pre = document.createElement("pre");
          pre.className = "mermaid";
          pre.dataset.rawGraph = w.dataset.rawGraph;
          pre.textContent = w.dataset.rawGraph;
          w.innerHTML = "";
          w.appendChild(pre);
        }
        await renderMermaidDiagramsInShadow(shadow, nowDark);
      },
      destroy: () => {},
    };

    renderOutline(outline, paneIdx);
    updateStatusBar();
  }

  async function mountPdfReader(paneIdx, viewport, item) {
    const activePdfUrl = item.fileUrl || "";
    const activePdfSize = item.sizeLabel || "";
    viewport.innerHTML = `
      <div class="pdf-viewer-shell">
        <div class="pdf-toolbar">
          <div class="pdf-toolbar-group">
            <button class="icon-btn-sm" data-pdf-act="prev" title="Página anterior">◀</button>
            <div class="pdf-page-indicator">
              <input type="number" min="1" value="1" class="pdf-page-input" aria-label="Número da página" />
              <span>/ <span class="pdf-total-pages">–</span></span>
            </div>
            <button class="icon-btn-sm" data-pdf-act="next" title="Próxima página">▶</button>
          </div>
          <div class="pdf-toolbar-group">
            <button class="icon-btn-sm" data-pdf-act="zoom-out" title="Reduzir zoom">−</button>
            <span class="pdf-zoom-label">Largura</span>
            <button class="icon-btn-sm" data-pdf-act="zoom-in" title="Ampliar zoom">+</button>
            <button class="toolbar-pill-btn" data-pdf-act="fit-width" title="Ajustar à largura do painel">Ajustar</button>
          </div>
          <div class="pdf-toolbar-group">
            <a class="toolbar-pill-btn" href="${escapeHtml(activePdfUrl)}" download title="Baixar apostila PDF">Baixar</a>
            <a class="toolbar-pill-btn" href="${escapeHtml(activePdfUrl)}" target="_blank" rel="noopener noreferrer" title="Abrir PDF em nova guia">↗</a>
          </div>
        </div>
        <div class="pdf-pages-stage">
          <div class="pdf-loading-msg">Carregando apostila PDF (${escapeHtml(activePdfSize)})...</div>
        </div>
      </div>
    `;

    const shell = viewport.querySelector(".pdf-viewer-shell");
    const stage = viewport.querySelector(".pdf-pages-stage");
    const pageInput = viewport.querySelector(".pdf-page-input");
    const totalSpan = viewport.querySelector(".pdf-total-pages");
    const zoomLabel = viewport.querySelector(".pdf-zoom-label");

    let destroyed = false;
    let pdfDoc = null;
    let observer = null;
    let resizeObserver = null;
    let zoomMode = "fit-width";
    let computedScale = 1.2;
    let currentPage = state.lastPdfPages[item.path] || 1;
    let pageSlots = [];
    let renderedAtScale = new Map();

    try {
      await loadScriptOnce(state.manifest.vendor.pdfJs);
      if (!window.pdfjsLib) throw new Error("PDF.js indisponível");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = state.manifest.vendor.pdfWorkerJs;

      const loadingTask = window.pdfjsLib.getDocument({
        url: activePdfUrl,
        cMapUrl: state.manifest.vendor.pdfCmapsUrl,
        cMapPacked: true,
      });
      pdfDoc = await loadingTask.promise;
    } catch (err) {
      if (destroyed) return;
      stage.innerHTML = `<iframe src="${escapeHtml(activePdfUrl)}" style="width:100%;height:100%;border:none;border-radius:4px;" title="${escapeHtml(item.title)}"></iframe>`;
      return;
    }

    if (destroyed || state.panes[paneIdx].activePath !== item.path) {
      pdfDoc.destroy();
      return;
    }

    const numPages = pdfDoc.numPages;
    currentPage = Math.min(Math.max(1, currentPage), numPages);
    totalSpan.textContent = String(numPages);
    pageInput.max = String(numPages);
    pageInput.value = String(currentPage);

    const firstPage = await pdfDoc.getPage(1);
    const baseViewport = firstPage.getViewport({ scale: 1 });

    function calculateScale() {
      if (zoomMode === "fit-width") {
        const availWidth = Math.max(260, stage.clientWidth - 44);
        const targetWidth = Math.min(availWidth, 920);
        computedScale = targetWidth / baseViewport.width;
        zoomLabel.textContent = `${Math.round(computedScale * 100)}%`;
      } else {
        computedScale = zoomMode;
        zoomLabel.textContent = `${Math.round(computedScale * 100)}%`;
      }
      if (paneIdx === state.focusedPane) {
        updateStatusBar();
      }
    }

    async function renderSinglePage(pageNum, slotEl) {
      if (destroyed) return;
      const targetScaleKey = computedScale.toFixed(3);
      if (renderedAtScale.get(pageNum) === targetScaleKey) return;
      renderedAtScale.set(pageNum, targetScaleKey);

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (destroyed) return;
        const vp = page.getViewport({ scale: computedScale });
        const dpr = Math.min(window.devicePixelRatio || 1, 2.25);

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width * dpr);
        canvas.height = Math.floor(vp.height * dpr);
        canvas.style.width = `${Math.floor(vp.width)}px`;
        canvas.style.height = `${Math.floor(vp.height)}px`;

        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.scale(dpr, dpr);

        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        if (destroyed) return;
        slotEl.innerHTML = "";
        slotEl.appendChild(canvas);
      } catch (_) {}
    }

    function rebuildStageLayout(preservePageNum) {
      calculateScale();
      renderedAtScale.clear();
      if (observer) observer.disconnect();

      const slotW = Math.floor(baseViewport.width * computedScale);
      const slotH = Math.floor(baseViewport.height * computedScale);

      stage.innerHTML = "";
      pageSlots = [];

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const pNum = Number(entry.target.dataset.pageNum);
              renderSinglePage(pNum, entry.target);
            }
          }
        },
        { root: stage, rootMargin: "700px 0px" }
      );

      for (let p = 1; p <= numPages; p++) {
        const slot = document.createElement("div");
        slot.className = "pdf-page-slot";
        slot.dataset.pageNum = String(p);
        slot.style.width = `${slotW}px`;
        slot.style.height = `${slotH}px`;
        stage.appendChild(slot);
        pageSlots.push(slot);
        observer.observe(slot);
      }

      if (preservePageNum > 1 && pageSlots[preservePageNum - 1]) {
        pageSlots[preservePageNum - 1].scrollIntoView({ block: "start" });
      }
    }

    function goToPage(pNum) {
      const clamped = Math.min(Math.max(1, pNum), numPages);
      currentPage = clamped;
      pageInput.value = String(clamped);
      const slot = pageSlots[clamped - 1];
      if (slot) {
        slot.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    stage.addEventListener("scroll", () => {
      const mid = stage.scrollTop + stage.clientHeight * 0.32;
      for (let i = 0; i < pageSlots.length; i++) {
        const s = pageSlots[i];
        if (s.offsetTop + s.offsetHeight >= mid) {
          if (currentPage !== i + 1) {
            currentPage = i + 1;
            pageInput.value = String(currentPage);
            state.lastPdfPages[item.path] = currentPage;
            persistState();
            if (paneIdx === state.focusedPane) updateStatusBar();
          }
          break;
        }
      }
    });

    shell.querySelector(".pdf-toolbar").addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-pdf-act]");
      if (!btn) return;
      const act = btn.dataset.pdfAct;
      if (act === "prev") goToPage(currentPage - 1);
      else if (act === "next") goToPage(currentPage + 1);
      else if (act === "zoom-in") {
        zoomMode = Math.min(2.4, Math.round((computedScale + 0.18) * 100) / 100);
        rebuildStageLayout(currentPage);
      } else if (act === "zoom-out") {
        zoomMode = Math.max(0.55, Math.round((computedScale - 0.18) * 100) / 100);
        rebuildStageLayout(currentPage);
      } else if (act === "fit-width") {
        zoomMode = "fit-width";
        rebuildStageLayout(currentPage);
      }
    });

    pageInput.addEventListener("change", () => {
      const val = parseInt(pageInput.value, 10);
      if (!Number.isNaN(val)) goToPage(val);
    });

    let lastStageWidth = stage.clientWidth;
    let resizeTimer = null;
    resizeObserver = new ResizeObserver(() => {
      if (zoomMode !== "fit-width") return;
      if (Math.abs(stage.clientWidth - lastStageWidth) < 12) return;
      lastStageWidth = stage.clientWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!destroyed) rebuildStageLayout(currentPage);
      }, 140);
    });

    rebuildStageLayout(currentPage);
    resizeObserver.observe(stage);

    if (paneIdx === state.focusedPane) {
      dom.outlineList.innerHTML =
        `<div class="sidebar-empty-hint">Apostila PDF com <strong>${numPages}</strong> página(s). Use os controles superiores para navegar.</div>`;
    }

    state.paneControllers[paneIdx] = {
      type: "pdf",
      getPageMeta: () => ({ currentPage, numPages, zoomPct: Math.round(computedScale * 100) }),
      refreshAppearance: () => {},
      destroy: () => {
        destroyed = true;
        if (observer) observer.disconnect();
        if (resizeObserver) resizeObserver.disconnect();
        if (pdfDoc) pdfDoc.destroy();
      },
    };

    updateStatusBar();
  }

  function refreshAllPanesAppearance() {
    [0, 1].forEach((idx) => {
      renderPaneActions(idx);
      const ctrl = state.paneControllers[idx];
      if (ctrl && typeof ctrl.refreshAppearance === "function") {
        ctrl.refreshAppearance();
      }
    });
    updateStatusBar();
  }

  function syncFocusedOutlineAndStatus() {
    const ctrl = state.paneControllers[state.focusedPane];
    if (ctrl && ctrl.type === "md") {
      renderOutline(ctrl.outline, state.focusedPane);
    } else if (ctrl && ctrl.type === "pdf") {
      const meta = ctrl.getPageMeta();
      dom.outlineList.innerHTML =
        `<div class="sidebar-empty-hint">Apostila PDF (${meta.numPages} páginas).</div>`;
    } else {
      dom.outlineList.innerHTML =
        '<div class="sidebar-empty-hint">Abra um documento .md para navegar pelas seções.</div>';
    }
    updateStatusBar();
  }

  function updateStatusBar() {
    const activePath = state.panes[state.focusedPane].activePath;
    if (!activePath || !state.manifest?.items[activePath]) {
      dom.statusDocMeta.textContent = "Nenhum capítulo aberto";
      dom.statusZoomMeta.textContent = `${Math.round(state.readerScale * 100)}%`;
      dom.commandCenterLabel.textContent =
        "Arquitetura de IA — Buscar capítulo .md, apostila .pdf ou submódulo em repos/";
      return;
    }

    const item = state.manifest.items[activePath];
    const fileName = activePath.split("/").pop();
    dom.commandCenterLabel.textContent = `${fileName} — Arquitetura de IA`;

    const ctrl = state.paneControllers[state.focusedPane];
    if (item.type === "pdf") {
      const pMeta = ctrl?.getPageMeta ? ctrl.getPageMeta() : null;
      const pdfSize = item.sizeLabel || "";
      dom.statusDocMeta.textContent = pMeta
        ? `PDF · Pág. ${pMeta.currentPage}/${pMeta.numPages} · ${pdfSize}`
        : `PDF · ${pdfSize}`;
      dom.statusZoomMeta.textContent = pMeta ? `${pMeta.zoomPct}%` : "100%";
    } else {
      const secCount = ctrl?.outline ? ctrl.outline.length : 0;
      dom.statusDocMeta.textContent = `Markdown · ${secCount} seções`;
      dom.statusZoomMeta.textContent = `${Math.round(state.readerScale * 100)}%`;
    }
  }

  function openCommandPalette() {
    dom.paletteBackdrop.hidden = false;
    dom.paletteInput.value = "";
    dom.paletteInput.placeholder =
      "Digite o nome ou título do capítulo .md, apostila .pdf ou submódulo em repos/...";
    filterPaletteItems("");
    setTimeout(() => dom.paletteInput.focus(), 15);
  }

  function closeCommandPalette() {
    dom.paletteBackdrop.hidden = true;
  }

  function filterPaletteItems(query) {
    const q = query.trim().toLowerCase();
    const allDocs = Object.values(state.manifest.items).filter((it) => !it.hiddenFromTree);
    const docOptions = allDocs
      .filter(
        (it) =>
          !q ||
          it.path.toLowerCase().includes(q) ||
          (it.title && it.title.toLowerCase().includes(q))
      )
      .slice(0, 45)
      .map((it) => ({
        kind: "file",
        path: it.path,
        type: it.type,
        title: it.title || it.path.split("/").pop(),
        sub: it.path,
      }));

    const repoOptions = (state.manifest.catalog?.repositories || [])
      .filter(
        (r) =>
          !q ||
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      )
      .map((r) => ({
        kind: "repo",
        path: r.localReadme || r.relatedDoc || "repos/README.md",
        type: "repo",
        title: `[repos/${r.id}] ${r.name}`,
        sub: r.description,
      }));

    state.paletteFiltered = [...docOptions, ...repoOptions].slice(0, 50);
    state.paletteIndex = 0;
    renderPaletteList();
  }

  function renderPaletteList() {
    if (state.paletteFiltered.length === 0) {
      dom.paletteList.innerHTML =
        '<li class="sidebar-empty-hint">Nenhum item correspondente encontrado.</li>';
      return;
    }
    dom.paletteList.innerHTML = state.paletteFiltered
      .map((opt, idx) => {
        const badge = fileBadgeHtml(opt.type);
        return (
          `<li class="palette-option ${idx === state.paletteIndex ? "is-selected" : ""}" data-palette-idx="${idx}" role="option">` +
          `${badge}` +
          `<div class="palette-opt-main">` +
          `<span class="palette-opt-title">${escapeHtml(opt.title)}</span>` +
          `<span class="palette-opt-sub">${escapeHtml(opt.sub)}</span>` +
          `</div>` +
          `</li>`
        );
      })
      .join("");

    const selectedEl = dom.paletteList.querySelector(".palette-option.is-selected");
    if (selectedEl) selectedEl.scrollIntoView({ block: "nearest" });
  }

  function confirmPaletteSelection(idx, openInSplit = false) {
    const opt = state.paletteFiltered[idx];
    if (!opt) return;
    closeCommandPalette();
    openDocument(opt.path, {
      paneIdx: openInSplit ? 1 : state.focusedPane,
      pinned: true,
    });
  }

  function setupResizers() {
    let draggingSidebar = false;
    dom.sidebarResizer.addEventListener("mousedown", (ev) => {
      if (state.sidebarCollapsed) return;
      ev.preventDefault();
      draggingSidebar = true;
      dom.sidebarResizer.classList.add("is-dragging");
    });

    let draggingSplit = false;
    dom.paneResizer.addEventListener("mousedown", (ev) => {
      if (!state.splitActive) return;
      ev.preventDefault();
      draggingSplit = true;
      dom.paneResizer.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", (ev) => {
      if (draggingSidebar) {
        const nextWidth = Math.min(520, Math.max(210, ev.clientX - 48));
        dom.sidebar.style.width = `${nextWidth}px`;
      } else if (draggingSplit) {
        const gridRect = document.getElementById("editor-grid").getBoundingClientRect();
        const ratio = Math.min(0.75, Math.max(0.25, (ev.clientX - gridRect.left) / gridRect.width));
        dom.pane0.style.flex = `${ratio}`;
        dom.pane1.style.flex = `${1 - ratio}`;
      }
    });

    window.addEventListener("mouseup", () => {
      if (draggingSidebar) {
        draggingSidebar = false;
        dom.sidebarResizer.classList.remove("is-dragging");
      }
      if (draggingSplit) {
        draggingSplit = false;
        dom.paneResizer.classList.remove("is-dragging");
      }
    });
  }

  function wireEvents() {
    document.querySelectorAll(".activity-btn[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => setSidebarView(btn.dataset.view));
    });

    document.getElementById("btn-activity-palette").addEventListener("click", () => openCommandPalette());
    document.getElementById("btn-command-center").addEventListener("click", () => openCommandPalette());
    document.getElementById("btn-activity-theme").addEventListener("click", toggleWorkbenchTheme);
    document.getElementById("btn-title-theme").addEventListener("click", toggleWorkbenchTheme);
    document.getElementById("btn-toggle-sidebar").addEventListener("click", () => toggleSidebar());
    document.getElementById("btn-mobile-menu").addEventListener("click", () => toggleSidebar());
    dom.sidebarBackdrop.addEventListener("click", () => toggleSidebar(true));
    document.getElementById("btn-toggle-split").addEventListener("click", toggleSplitReading);
    dom.statusContextBtn.addEventListener("click", () => {
      setSidebarView("catalog");
      if (state.manifest?.items["repos/README.md"]) {
        openDocument("repos/README.md", { pinned: true });
      }
    });

    document.getElementById("btn-expand-all").addEventListener("click", () => {
      function collectDirs(nodes) {
        for (const n of nodes) {
          if (n.kind === "dir") {
            state.expandedDirs.add(n.path);
            collectDirs(n.children || []);
          }
        }
      }
      collectDirs(state.manifest.tree);
      persistState();
      renderFileTree();
    });

    document.getElementById("btn-collapse-all").addEventListener("click", () => {
      state.expandedDirs.clear();
      persistState();
      renderFileTree();
    });

    document.getElementById("btn-section-repo").addEventListener("click", (ev) => {
      const btn = ev.currentTarget;
      const expanded = btn.classList.toggle("is-expanded");
      btn.parentElement.classList.toggle("is-collapsed", !expanded);
    });

    document.getElementById("btn-section-outline").addEventListener("click", (ev) => {
      const btn = ev.currentTarget;
      const expanded = btn.classList.toggle("is-expanded");
      dom.outlineSection.classList.toggle("is-collapsed", !expanded);
    });

    dom.fileTree.addEventListener("click", (ev) => {
      const quickPdf = ev.target.closest("[data-open-pdf]");
      if (quickPdf) {
        ev.stopPropagation();
        openDocument(quickPdf.dataset.openPdf, { pinned: true });
        return;
      }

      const dirRow = ev.target.closest("[data-dir-path]");
      if (dirRow) {
        const dPath = dirRow.dataset.dirPath;
        if (state.expandedDirs.has(dPath)) state.expandedDirs.delete(dPath);
        else state.expandedDirs.add(dPath);
        persistState();
        renderFileTree();
        return;
      }

      const fileRow = ev.target.closest("[data-file-path]");
      if (fileRow) {
        const fPath = fileRow.dataset.filePath;
        const openSide = ev.metaKey || ev.ctrlKey;
        openDocument(fPath, {
          paneIdx: openSide ? 1 : state.focusedPane,
          pinned: openSide,
        });
      }
    });

    dom.fileTree.addEventListener("dblclick", (ev) => {
      const fileRow = ev.target.closest("[data-file-path]");
      if (fileRow) {
        openDocument(fileRow.dataset.filePath, { pinned: true });
      }
    });

    dom.outlineList.addEventListener("click", (ev) => {
      const row = ev.target.closest("[data-heading-id]");
      if (!row) return;
      const ctrl = state.paneControllers[state.focusedPane];
      if (ctrl && ctrl.scrollToAnchor) {
        ctrl.scrollToAnchor(row.dataset.headingId);
      }
    });

    let searchTimer = null;
    dom.searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runGlobalSearch(dom.searchInput.value), 120);
    });

    dom.searchResults.addEventListener("click", (ev) => {
      const target = ev.target.closest("[data-doc-open]");
      if (target) {
        openDocument(target.dataset.docOpen, { pinned: true });
      }
    });

    dom.catalogContainer.addEventListener("click", (ev) => {
      const pdfBtn = ev.target.closest("[data-open-pdf]");
      if (pdfBtn) {
        ev.stopPropagation();
        openDocument(pdfBtn.dataset.openPdf, { pinned: true });
        return;
      }
      const docEl = ev.target.closest("[data-doc-open]");
      if (docEl) {
        openDocument(docEl.dataset.docOpen, { pinned: true });
      }
    });

    [0, 1].forEach((paneIdx) => {
      const paneEl = paneIdx === 0 ? dom.pane0 : dom.pane1;
      paneEl.addEventListener("mousedown", () => setFocusedPane(paneIdx));

      dom.tabs[paneIdx].addEventListener("click", (ev) => {
        const closeBtn = ev.target.closest("[data-close-tab]");
        if (closeBtn) {
          ev.stopPropagation();
          closeTab(paneIdx, closeBtn.dataset.closeTab);
          return;
        }
        const tab = ev.target.closest("[data-tab-path]");
        if (tab) {
          openDocument(tab.dataset.tabPath, { paneIdx, closeMobileDrawer: false });
        }
      });

      dom.tabs[paneIdx].addEventListener("dblclick", (ev) => {
        const tab = ev.target.closest("[data-tab-path]");
        if (tab) {
          openDocument(tab.dataset.tabPath, { paneIdx, pinned: true, closeMobileDrawer: false });
        }
      });

      dom.tabs[paneIdx].addEventListener("auxclick", (ev) => {
        if (ev.button !== 1) return;
        const tab = ev.target.closest("[data-tab-path]");
        if (tab) {
          ev.preventDefault();
          closeTab(paneIdx, tab.dataset.tabPath);
        }
      });

      dom.actions[paneIdx].addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-action]");
        if (!btn) return;
        const act = btn.dataset.action;
        if (act === "open-paired-pdf" || act === "open-paired-md") {
          openDocument(btn.dataset.target, { paneIdx, pinned: true });
        } else if (act === "split-paired-pdf") {
          enableSplitPane();
          openDocument(btn.dataset.target, { paneIdx: 1, pinned: true });
        } else if (act === "toggle-sheet-mode") {
          state.sheetMode = state.sheetMode === "paper" ? "auto" : "paper";
          persistState();
          refreshAllPanesAppearance();
        } else if (act === "font-inc") {
          state.readerScale = Math.min(1.35, Math.round((state.readerScale + 0.08) * 100) / 100);
          persistState();
          refreshAllPanesAppearance();
        } else if (act === "font-dec") {
          state.readerScale = Math.max(0.85, Math.round((state.readerScale - 0.08) * 100) / 100);
          persistState();
          refreshAllPanesAppearance();
        } else if (act === "close-split") {
          disableSplitPane();
        }
      });
    });

    dom.paletteBackdrop.addEventListener("click", (ev) => {
      if (ev.target === dom.paletteBackdrop) closeCommandPalette();
    });

    dom.paletteInput.addEventListener("input", () => filterPaletteItems(dom.paletteInput.value));

    dom.paletteInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeCommandPalette();
      } else if (ev.key === "ArrowDown") {
        ev.preventDefault();
        if (state.paletteFiltered.length > 0) {
          state.paletteIndex = (state.paletteIndex + 1) % state.paletteFiltered.length;
          renderPaletteList();
        }
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        if (state.paletteFiltered.length > 0) {
          state.paletteIndex =
            (state.paletteIndex - 1 + state.paletteFiltered.length) %
            state.paletteFiltered.length;
          renderPaletteList();
        }
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        confirmPaletteSelection(state.paletteIndex, ev.metaKey || ev.ctrlKey);
      }
    });

    dom.paletteList.addEventListener("click", (ev) => {
      const li = ev.target.closest("[data-palette-idx]");
      if (li) {
        confirmPaletteSelection(Number(li.dataset.paletteIdx), ev.metaKey || ev.ctrlKey);
      }
    });

    window.addEventListener("keydown", (ev) => {
      const mod = ev.metaKey || ev.ctrlKey;
      const key = ev.key.toLowerCase();

      if (mod && !ev.shiftKey && key === "p") {
        ev.preventDefault();
        openCommandPalette();
      } else if (mod && ev.shiftKey && key === "f") {
        ev.preventDefault();
        setSidebarView("search");
      } else if (mod && ev.shiftKey && key === "e") {
        ev.preventDefault();
        setSidebarView("explorer");
      } else if (mod && !ev.shiftKey && key === "b") {
        ev.preventDefault();
        toggleSidebar();
      } else if (mod && key === "\\") {
        ev.preventDefault();
        toggleSplitReading();
      } else if (ev.key === "Escape" && !dom.paletteBackdrop.hidden) {
        closeCommandPalette();
      }
    });

    window.addEventListener("hashchange", () => {
      if (state.suppressHashEvent) return;
      const parsed = parseLocationHash();
      const normPath = normalizeDocPath(parsed.path);
      if (normPath && state.manifest?.items[normPath]) {
        openDocument(normPath, { anchor: parsed.anchor, pinned: false });
      }
    });
  }

  function parseLocationHash() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    if (!raw) return { path: "", anchor: "" };
    const hashPos = raw.indexOf("#");
    if (hashPos === -1) {
      return { path: decodeURIComponent(raw), anchor: "" };
    }
    return {
      path: decodeURIComponent(raw.slice(0, hashPos)),
      anchor: decodeURIComponent(raw.slice(hashPos + 1)),
    };
  }

  async function init() {
    loadPersistedState();
    dom.html.setAttribute("data-workbench-theme", state.workbenchTheme);

    if (isMobileViewport()) {
      state.sidebarCollapsed = true;
      dom.sidebar.classList.add("is-collapsed");
    }

    setupResizers();
    wireEvents();

    try {
      const [manifestResp, cssResp] = await Promise.all([
        fetch("./data/manifest.json"),
        fetch("./assets/editorial-theme.css"),
      ]);
      if (!manifestResp.ok) throw new Error("Não foi possível carregar manifest.json");
      state.manifest = await manifestResp.json();
      state.editorialCss = cssResp.ok ? await cssResp.text() : "";
    } catch (err) {
      dom.viewports[0].innerHTML = `<div class="pdf-loading-msg">Erro ao iniciar visualizador: ${escapeHtml(err.message)}</div>`;
      return;
    }

    const reposCount = state.manifest.catalog?.repositories?.length || 0;
    dom.statusContextLabel.textContent = `Ecossistema repos/ (${reposCount} módulos)`;

    renderFileTree();
    renderCatalogView();

    const initial = parseLocationHash();
    const initialNorm = normalizeDocPath(initial.path);
    const startDoc =
      initialNorm && state.manifest.items[initialNorm]
        ? initialNorm
        : state.manifest.defaultDoc;

    if (startDoc) {
      await openDocument(startDoc, {
        paneIdx: 0,
        pinned: true,
        anchor: initial.anchor,
        closeMobileDrawer: false,
      });
    } else {
      renderEmptyWatermark(dom.viewports[0]);
    }
  }

  init();
})();
