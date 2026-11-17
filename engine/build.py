from __future__ import annotations

import argparse
import html as html_lib
import os
import re
import urllib.request
from pathlib import Path
from typing import Any

import jinja2
import markdown
import yaml
from playwright.sync_api import Browser, sync_playwright

ENGINE_DIR = Path(__file__).resolve().parent
ROOT_DIR = ENGINE_DIR.parent
DOCS_DIR = ROOT_DIR / "docs"
REPOS_DIR = ROOT_DIR / "repos"
THEMES_DIR = ENGINE_DIR / "themes"
TEMPLATES_DIR = ENGINE_DIR / "templates"
CACHE_DIR = ENGINE_DIR / ".cache"
DIST_DIR = ROOT_DIR / "dist"

MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
MERMAID_CACHE_FILE = CACHE_DIR / "mermaid.min.js"

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
FENCE_OPEN_RE = re.compile(r"^(`{3,}|~{3,})\s*([a-zA-Z0-9_-]*)\s*$")
EMOJI_STRIP_RE = re.compile(
    r"^[\U00010000-\U0010ffff\u2600-\u27bf\ufe0f\u200d\s]+", flags=re.UNICODE
)

BOX_DRAWING_CHARS = set("┌┐└┘├┤┬┴┼─│▼▲◄►╔╗╚╝═║▓░")
TREE_CHARS = ("├──", "└──", "├─", "└─")

MERMAID_EMOJI_MAP: dict[str, str] = {
    "1️⃣": "1. ",
    "2️⃣": "2. ",
    "3️⃣": "3. ",
    "4️⃣": "4. ",
    "5️⃣": "5. ",
    "6️⃣": "6. ",
    "7️⃣": "7. ",
    "8️⃣": "8. ",
    "9️⃣": "9. ",
    "🌫️": "",
    "✅": "✓ ",
    "❌": "✗ ",
    "😱": "",
    "🧑": "",
    "☁️": "",
    "⚙️": "",
    "📝": "",
    "👀": "",
    "🏋️": "",
    "🗄️": "",
    "🔑": "",
    "📞": "",
    "🚨": "",
    "🗑️": "",
    "🟢": "",
    "🟡": "",
    "🔴": "",
    "🔵": "",
    "🟠": "",
    "🟣": "",
}

LANG_DISPLAY_NAMES: dict[str, str] = {
    "python": "PYTHON",
    "py": "PYTHON",
    "typescript": "TYPESCRIPT",
    "ts": "TYPESCRIPT",
    "javascript": "JAVASCRIPT",
    "js": "JAVASCRIPT",
    "json": "JSON",
    "bash": "BASH / SHELL",
    "sh": "SHELL",
    "zsh": "SHELL",
    "sql": "SQL",
    "yaml": "YAML",
    "yml": "YAML",
    "dockerfile": "DOCKERFILE",
    "hcl": "TERRAFORM / HCL",
    "toml": "TOML",
    "html": "HTML",
    "css": "CSS",
    "xml": "XML",
}

CALLOUT_TYPES: dict[str, tuple[str, str]] = {
    "NOTE": ("callout-note", "Nota"),
    "INFO": ("callout-note", "Informação"),
    "TIP": ("callout-tip", "Dica Prática"),
    "IMPORTANT": ("callout-pronunciation", "Importante"),
    "WARNING": ("callout-warn", "Atenção"),
    "WARN": ("callout-warn", "Atenção"),
    "CAUTION": ("callout-error", "Cuidado Crítico"),
    "DANGER": ("callout-error", "Risco Crítico"),
}

MODULES_META: dict[str, dict[str, str]] = {
    "01-fundamentos": {
        "num": "01",
        "title": "Módulo 01 — Fundamentos de LLMs",
        "badge": "Fundamentos",
        "subtitle": "O que significa aprender, previsão do próximo token, anatomia física de tensores, inference engines e fine-tuning.",
    },
    "02-orquestracao": {
        "num": "02",
        "title": "Módulo 02 — Orquestração e Padrões de Agentes",
        "badge": "Orquestração",
        "subtitle": "Arquitetura de orquestradores, frameworks, roteamento de modelos, padrões de execução (ReAct a multi-agente) e estudos de caso.",
    },
    "03-rag-dados": {
        "num": "03",
        "title": "Módulo 03 — RAG e Dados Vetoriais",
        "badge": "RAG & Vetores",
        "subtitle": "Embeddings, estratégias de chunking, índices ANN (HNSW/IVF), busca híbrida, reranking e comparativo de bancos vetoriais.",
    },
    "04-infraestrutura": {
        "num": "04",
        "title": "Módulo 04 — Infraestrutura e Hospedagem de Modelos",
        "badge": "Infraestrutura",
        "subtitle": "Onde e como servir LLMs: APIs gerenciadas, instâncias GPU dedicadas e plataformas de Serverless GPU.",
    },
    "05-governanca-seguranca": {
        "num": "05",
        "title": "Módulo 05 — Governança, FinOps e Segurança",
        "badge": "Governança & FinOps",
        "subtitle": "Controle de tokens e orçamento, AI Gateways, posicionamento arquitetural, prevenção de vazamento de dados e observabilidade.",
    },
    "06-adocao-empresa": {
        "num": "06",
        "title": "Módulo 06 — Adoção de IA na Empresa",
        "badge": "Estratégia",
        "subtitle": "Como transformar modelos, contexto e interfaces em uma estrutura corporativa de IA sustentável.",
    },
}


def ensure_mermaid_js() -> Path:
    if MERMAID_CACHE_FILE.exists():
        return MERMAID_CACHE_FILE
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(MERMAID_CDN_URL, MERMAID_CACHE_FILE)
    return MERMAID_CACHE_FILE


def load_theme_css(theme_name: str = "default") -> str:
    theme_file = THEMES_DIR / theme_name / "theme.css"
    if not theme_file.exists():
        theme_file = THEMES_DIR / "default" / "theme.css"
    return theme_file.read_text(encoding="utf-8")


def parse_frontmatter(raw_text: str) -> tuple[dict[str, Any], str]:
    match = FRONTMATTER_RE.match(raw_text)
    if not match:
        return {}, raw_text
    try:
        meta = yaml.safe_load(match.group(1)) or {}
        if not isinstance(meta, dict):
            meta = {}
    except Exception:
        meta = {}
    body = raw_text[match.end() :]
    return meta, body


def render_inline_markdown(text: str) -> str:
    rendered = markdown.markdown(text, extensions=["sane_lists"])
    return re.sub(r"^<p>(.*)</p>$", r"\1", rendered.strip(), flags=re.DOTALL)


def render_markdown_fragment(text: str) -> str:
    return markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists"])


def normalize_mermaid_style_line(line: str) -> str:
    m = re.match(r"^(\s*style\s+[A-Za-z0-9_-]+\s+)(.+)$", line)
    if not m:
        return line
    prefix, rest = m.group(1), m.group(2).lower()
    if any(k in rest for k in ("#8b0000", "#7f1d1d", "#3d0000", "#450a0a", "#ff0000", "#dc2626")):
        return f"{prefix}fill:#fef2f2,stroke:#dc2626,color:#7f1d1d,stroke-width:1.5px"
    if any(k in rest for k in ("#006400", "#065f46", "#2d6a1e", "#003d00", "#064e3b", "#059669")):
        return f"{prefix}fill:#ecfdf5,stroke:#059669,color:#064e3b,stroke-width:1.5px"
    if any(k in rest for k in ("#8b4500", "#8b6914", "#78350f", "#6a6a00", "#ffa500", "#d97706")):
        return f"{prefix}fill:#fffbeb,stroke:#d97706,color:#78350f,stroke-width:1.5px"
    if any(k in rest for k in ("#00008b", "#1e3a8a", "#0f3460", "#16213e", "#2563eb")):
        return f"{prefix}fill:#eff6ff,stroke:#2563eb,color:#1e3a8a,stroke-width:1.5px"
    if any(k in rest for k in ("#1a1a2e", "#0d1117", "#533483", "#115e59", "#7c3aed")):
        return f"{prefix}fill:#f5f3ff,stroke:#7c3aed,color:#3b0764,stroke-width:1.5px"
    return line


def normalize_mermaid_code(raw_mermaid: str) -> str:
    """
    1. Convert literal \\n inside Mermaid labels into <br/>
    2. Strip/replace broken keycap & decorative emojis inside labels
    3. Auto-reflow wide 'flowchart LR' / 'graph LR' (>= 4 nodes) into 'flowchart TD' so boxes stay 100% readable
    4. Convert dark/neon 'style NODE fill:...' into high-contrast editorial pastel cards
    """
    code = raw_mermaid.replace("\\n", "<br/>")
    for emo, repl in MERMAID_EMOJI_MAP.items():
        code = code.replace(emo, repl)

    # Count distinct node definitions or arrows in LR diagrams
    node_defs = re.findall(r'\b[A-Za-z0-9_]+\s*[\[\(\{"]', code)
    arrow_count = len(re.findall(r"-->|==>|-\.->", code))
    if re.search(r"^\s*(?:flowchart|graph)\s+LR\b", code, flags=re.MULTILINE):
        if len(node_defs) >= 5 or arrow_count >= 5:
            code = re.sub(
                r"^(\s*(?:flowchart|graph))\s+LR\b",
                r"\1 TD",
                code,
                count=1,
                flags=re.MULTILINE,
            )

    out_lines = [normalize_mermaid_style_line(ln) for ln in code.splitlines()]
    return "\n".join(out_lines)


def highlight_ascii_diagram_html(raw_text: str) -> str:
    escaped_lines: list[str] = []
    for line in raw_text.splitlines():
        # Check for trailing comment starting with ← or //
        comment_match = re.search(r"(\s+(?:←|◄──|//|#\s).*)$", line)
        if comment_match:
            main_part = line[: comment_match.start()]
            comment_part = comment_match.group(1)
        else:
            main_part = line
            comment_part = ""

        buf: list[str] = []
        for ch in main_part:
            if ch in "▼▲◄►→←":
                buf.append(f'<span class="ascii-arrow-ch">{html_lib.escape(ch)}</span>')
            elif ch in "▓░":
                buf.append(f'<span class="ascii-shade-ch">{html_lib.escape(ch)}</span>')
            elif ch in "┌┐└┘├┤┬┴┼─│╔╗╚╝═║":
                buf.append(f'<span class="ascii-box-ch">{html_lib.escape(ch)}</span>')
            else:
                buf.append(html_lib.escape(ch))

        if comment_part:
            buf.append(f'<span class="ascii-comment">{html_lib.escape(comment_part)}</span>')
        escaped_lines.append("".join(buf))
    return "\n".join(escaped_lines)


def render_fenced_block_html(lang: str, block_lines: list[str]) -> str:
    raw_content = "\n".join(block_lines).rstrip()
    lang_clean = lang.strip().lower()

    if lang_clean == "mermaid":
        normalized_mmd = normalize_mermaid_code(raw_content)
        escaped = html_lib.escape(normalized_mmd)
        return (
            '<figure class="diagram-container">'
            '<div class="diagram-header"><span>DIAGRAMA DE ARQUITETURA / FLUXO</span></div>'
            f'<div class="diagram-svg-stage"><pre class="mermaid">{escaped}</pre></div>'
            "</figure>"
        )

    is_untagged_or_text = lang_clean in ("", "text", "ascii", "plaintext")
    has_box_chars = any(ch in raw_content for ch in BOX_DRAWING_CHARS)

    if is_untagged_or_text and has_box_chars:
        is_tree = any(tc in raw_content for tc in TREE_CHARS) and ("/" in raw_content or ".md" in raw_content or ".json" in raw_content or ".yaml" in raw_content or ".py" in raw_content)
        header_label = "ESTRUTURA DE DIRETÓRIOS E ARQUIVOS" if is_tree else "ESQUEMA TÉCNICO / ARQUITETURA"
        extra_cls = " is-tree" if is_tree else ""
        highlighted = highlight_ascii_diagram_html(raw_content)
        return (
            f'<figure class="ascii-diagram{extra_cls}">'
            f'<figcaption class="ascii-diagram-header"><span>{header_label}</span></figcaption>'
            f'<pre class="ascii-diagram-body">{highlighted}</pre>'
            f"</figure>"
        )

    lang_badge = LANG_DISPLAY_NAMES.get(lang_clean, lang_clean.upper() if lang_clean else "CÓDIGO / EXEMPLO")
    escaped_code = html_lib.escape(raw_content)
    return (
        '<div class="code-block-card">'
        f'<div class="code-block-header"><span class="code-lang-tag">{html_lib.escape(lang_badge)}</span></div>'
        f"<pre><code>{escaped_code}</code></pre>"
        "</div>"
    )


def preprocess_markdown(md_text: str, strip_first_h1: bool = False) -> tuple[str, dict[str, str], str, str]:
    lines = md_text.splitlines()
    out_chunks: list[str] = []
    placeholders: dict[str, str] = {}
    counter = 0
    extracted_title = ""
    extracted_summary = ""

    def stash_html(raw_html: str) -> str:
        nonlocal counter
        counter += 1
        token = f"@@WEB_HTML_BLOCK_{counter}@@"
        placeholders[token] = raw_html
        return f"\n\n{token}\n\n"

    h1_seen = False

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not h1_seen and stripped.startswith("# "):
            h1_seen = True
            raw_t = re.sub(r"`([^`]+)`", r"\1", stripped[2:]).strip()
            extracted_title = EMOJI_STRIP_RE.sub("", raw_t).strip() or raw_t
            if strip_first_h1:
                i += 1
                while i < len(lines) and lines[i].strip() == "":
                    i += 1
                if (
                    i < len(lines)
                    and lines[i].lstrip().startswith(">")
                    and not re.match(r"^>\s*\[!", lines[i].lstrip())
                ):
                    q_lines: list[str] = []
                    while i < len(lines) and lines[i].lstrip().startswith(">"):
                        q_clean = re.sub(r"^>\s?", "", lines[i].lstrip()).strip()
                        if q_clean:
                            q_lines.append(q_clean)
                        i += 1
                    raw_sum = " ".join(q_lines)
                    extracted_summary = re.sub(r"[*_`]", "", raw_sum)
                    while i < len(lines) and lines[i].strip() == "":
                        i += 1
                    if i < len(lines) and re.match(r"^(?:---+|\*\*\*+|___+)\s*$", lines[i].strip()):
                        i += 1
                continue

        fence_match = FENCE_OPEN_RE.match(stripped)
        if fence_match:
            fence_token = fence_match.group(1)
            lang = (fence_match.group(2) or "").lower()
            fence_char = fence_token[0]
            fence_len = len(fence_token)
            block_lines: list[str] = []
            i += 1
            while i < len(lines) and not re.match(
                rf"^({re.escape(fence_char)}{{{fence_len},}})\s*$", lines[i].strip()
            ):
                block_lines.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1
            out_chunks.append(stash_html(render_fenced_block_html(lang, block_lines)))
            continue

        callout_match = re.match(r"^>\s*\[!([A-Za-z0-9_-]+)\]\s*(.*)$", line)
        if callout_match:
            raw_kind = callout_match.group(1).upper()
            inline_title = callout_match.group(2).strip()
            css_class, default_title = CALLOUT_TYPES.get(
                raw_kind, ("callout-note", raw_kind.title())
            )
            title = (
                render_inline_markdown(inline_title)
                if inline_title
                else html_lib.escape(default_title)
            )
            quote_lines: list[str] = []
            i += 1
            while i < len(lines) and lines[i].startswith(">"):
                quote_lines.append(re.sub(r"^>\s?", "", lines[i]))
                i += 1
            inner_html = render_markdown_fragment("\n".join(quote_lines))
            callout_html = (
                f'<aside class="callout {css_class}">'
                f'<div class="callout-title">{title}</div>'
                f'<div class="callout-body">{inner_html}</div>'
                f"</aside>"
            )
            out_chunks.append(stash_html(callout_html))
            continue

        if (
            re.match(r"^\s*(?:[-*+]|\d+\.)\s+", line)
            and out_chunks
            and out_chunks[-1].strip() != ""
            and not re.match(r"^\s*(?:[-*+]|\d+\.)\s+", out_chunks[-1])
        ):
            out_chunks.append("")

        out_chunks.append(line)
        i += 1

    return "\n".join(out_chunks), placeholders, extracted_title, extracted_summary


def infer_chapter_meta(md_path: Path, fm: dict[str, Any], title: str, summary: str) -> dict[str, Any]:
    rel_docs = md_path.relative_to(DOCS_DIR).as_posix() if md_path.is_relative_to(DOCS_DIR) else md_path.name
    parts = rel_docs.split("/")
    mod_slug = parts[0] if len(parts) > 1 else ""
    mod_info = MODULES_META.get(mod_slug, {})
    mod_num = mod_info.get("num", "")
    mod_title = mod_info.get("title", mod_slug)
    badge = mod_info.get("badge", "Arquitetura de IA")

    code = ""
    if len(parts) == 2:
        num_m = re.match(r"^(\d+)-", parts[1])
        if num_m and mod_num:
            code = f"{int(mod_num)}.{int(num_m.group(1))}"
    elif len(parts) == 3:
        sub_m = re.match(r"^(\d+)-", parts[1])
        ch_m = re.match(r"^(\d+)-", parts[2])
        if sub_m and ch_m and mod_num:
            code = f"{int(mod_num)}.{int(sub_m.group(1))}.{int(ch_m.group(1))}"
        elif sub_m and mod_num:
            code = f"{int(mod_num)}.{int(sub_m.group(1))}"

    return {
        "title": str(fm.get("title") or title or md_path.stem.replace("-", " ").title()),
        "summary": str(fm.get("summary") or summary or ""),
        "module_slug": mod_slug,
        "module_title": mod_title,
        "badge": badge,
        "code": code,
        "rel_docs": rel_docs,
    }


def compile_chapter(md_path: Path, strip_first_h1: bool = True) -> dict[str, Any]:
    raw_text = md_path.read_text(encoding="utf-8")
    fm, md_body = parse_frontmatter(raw_text)
    processed_md, placeholders, ext_title, ext_summary = preprocess_markdown(
        md_body, strip_first_h1=strip_first_h1
    )
    body_html = markdown.markdown(
        processed_md,
        extensions=["tables", "fenced_code", "sane_lists"],
    )
    body_html = re.sub(
        r"<li>\[ \]\s*",
        '<li class="task-item"><span class="task-box" aria-hidden="true"></span>',
        body_html,
    )
    body_html = re.sub(
        r"<li>\[x\]\s*",
        '<li class="task-item is-checked"><span class="task-box is-checked" aria-hidden="true"></span>',
        body_html,
    )
    for token, raw_html in placeholders.items():
        body_html = body_html.replace(f"<p>{token}</p>", raw_html).replace(token, raw_html)

    meta = infer_chapter_meta(md_path, fm, ext_title, ext_summary)
    return {
        "path": md_path,
        "meta": meta,
        "body_html": body_html,
    }


def launch_browser(playwright_ctx: Any) -> Browser:
    chrome_mac = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    if chrome_mac.exists() or os.environ.get("USE_SYSTEM_CHROME") == "1":
        try:
            return playwright_ctx.chromium.launch(channel="chrome", headless=True)
        except Exception:
            pass
    return playwright_ctx.chromium.launch(headless=True)


def html_to_pdf(browser: Browser, html_content: str, output_pdf: Path, header_label: str) -> None:
    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    page = browser.new_page()
    try:
        page.set_content(html_content, wait_until="load")

        if 'class="mermaid"' in html_content:
            mermaid_js = ensure_mermaid_js()
            page.add_script_tag(path=str(mermaid_js))
            page.evaluate(
                """async () => {
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: 'base',
                        flowchart: { htmlLabels: true, curve: 'basis', padding: 14, nodeSpacing: 26, rankSpacing: 30 },
                        themeVariables: {
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '13px',
                            primaryColor: '#eff6ff',
                            primaryTextColor: '#0f172a',
                            primaryBorderColor: '#2563eb',
                            lineColor: '#2563eb',
                            edgeLabelBackground: '#ffffff',
                            secondaryColor: '#f8fafc',
                            tertiaryColor: '#ffffff'
                        }
                    });
                    for (const el of document.querySelectorAll('.mermaid')) {
                        try {
                            await mermaid.run({ nodes: [el] });
                        } catch (err) {
                            console.warn('Mermaid error:', err);
                        }
                    }
                }"""
            )

        footer_template = (
            '<div style="width:100%; font-family:-apple-system,BlinkMacSystemFont,sans-serif; font-size:7.8pt; '
            'color:#64748b; padding:0 16mm; display:flex; justify-content:space-between; border-top:0.5px solid #e2e8f0; padding-top:4px;">'
            f"<span>{html_lib.escape(header_label)}</span>"
            '<span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>'
            "</div>"
        )
        page.pdf(
            path=str(output_pdf),
            format="A4",
            print_background=True,
            display_header_footer=True,
            header_template="<div></div>",
            footer_template=footer_template,
            margin={"top": "16mm", "bottom": "18mm", "left": "16mm", "right": "16mm"},
        )
    finally:
        page.close()


def discover_chapter_files() -> list[Path]:
    files: list[Path] = []
    if not DOCS_DIR.exists():
        return files
    for md in sorted(DOCS_DIR.rglob("*.md")):
        if md.name == "README.md" and md.parent.parent == DOCS_DIR:
            continue
        files.append(md)
    return files


def build_single_topic_pdf(
    browser: Browser,
    jinja_env: jinja2.Environment,
    theme_css: str,
    md_path: Path,
) -> Path:
    ch = compile_chapter(md_path, strip_first_h1=True)
    template = jinja_env.get_template("topic.html.j2")
    html = template.render(meta=ch["meta"], body_html=ch["body_html"], theme_css=theme_css)

    rel_path = md_path.resolve().relative_to(DOCS_DIR.resolve())
    output_pdf = (DIST_DIR / "topicos" / rel_path).with_suffix(".pdf")
    code_prefix = f"Cap. {ch['meta']['code']} · " if ch["meta"].get("code") else ""
    label = f"{code_prefix}{ch['meta']['title']} — Guia de Arquitetura de IA"
    html_to_pdf(browser, html, output_pdf, header_label=label)
    return output_pdf


def build_module_notebook_pdf(
    browser: Browser,
    jinja_env: jinja2.Environment,
    theme_css: str,
    mod_slug: str,
) -> Path | None:
    mod_dir = DOCS_DIR / mod_slug
    if not mod_dir.exists():
        return None
    mod_info = MODULES_META.get(mod_slug)
    if not mod_info:
        return None

    md_files = [
        p for p in sorted(mod_dir.rglob("*.md")) if not (p.name == "README.md" and p.parent == mod_dir)
    ]
    if not md_files:
        return None

    chapters = [compile_chapter(p, strip_first_h1=True) for p in md_files]
    template = jinja_env.get_template("module.html.j2")
    html = template.render(module=mod_info, chapters=chapters, theme_css=theme_css)

    output_pdf = DIST_DIR / "modulos" / f"{mod_slug}.pdf"
    label = f"{mod_info['title']} — Caderno Completo"
    html_to_pdf(browser, html, output_pdf, header_label=label)
    return output_pdf


def build_all_pdfs(theme_name: str = "default") -> None:
    theme_css = load_theme_css(theme_name)
    jinja_env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=True,
    )
    chapter_files = discover_chapter_files()

    with sync_playwright() as pw:
        browser = launch_browser(pw)
        try:
            for md_file in chapter_files:
                out = build_single_topic_pdf(browser, jinja_env, theme_css, md_file)
                print(f"[ok] PDF Capítulo: {out.relative_to(ROOT_DIR)}")

            for mod_slug in MODULES_META.keys():
                out_mod = build_module_notebook_pdf(browser, jinja_env, theme_css, mod_slug)
                if out_mod:
                    print(f"[ok] PDF Caderno do Módulo: {out_mod.relative_to(ROOT_DIR)}")
        finally:
            browser.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compilador Editorial Markdown -> PDF A4 (Guia de Arquitetura de IA)"
    )
    parser.add_argument("--file", type=str, help="Caminho de um capítulo .md específico para gerar PDF")
    parser.add_argument("--theme", type=str, default="default", help="Tema CSS em engine/themes/")
    args = parser.parse_args()

    theme_css = load_theme_css(args.theme)
    jinja_env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=True,
    )

    if args.file:
        target = Path(args.file)
        if not target.is_absolute():
            target = (ROOT_DIR / target).resolve()
        if not target.exists():
            raise FileNotFoundError(f"Arquivo não encontrado: {target}")
        with sync_playwright() as pw:
            browser = launch_browser(pw)
            try:
                out = build_single_topic_pdf(browser, jinja_env, theme_css, target)
                print(f"[ok] PDF gerado: {out.relative_to(ROOT_DIR)}")
            finally:
                browser.close()
        return

    build_all_pdfs(theme_name=args.theme)


if __name__ == "__main__":
    main()
