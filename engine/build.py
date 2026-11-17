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


def normalize_mermaid_code(raw_mermaid: str) -> str:
    """Convert literal \\n inside Mermaid labels into <br/> so Mermaid v11 renders multi-line nodes cleanly."""
    return raw_mermaid.replace("\\n", "<br/>")


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

    in_outer_fence = False
    outer_fence_char = ""
    outer_fence_len = 0
    h1_seen = False
    summary_collected = False

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if in_outer_fence:
            close_match = re.match(
                rf"^({re.escape(outer_fence_char)}{{{outer_fence_len},}})\s*$", stripped
            )
            if close_match:
                in_outer_fence = False
            out_chunks.append(line)
            i += 1
            continue

        if not h1_seen and stripped.startswith("# "):
            h1_seen = True
            raw_t = re.sub(r"`([^`]+)`", r"\1", stripped[2:]).strip()
            extracted_title = EMOJI_STRIP_RE.sub("", raw_t).strip() or raw_t
            if strip_first_h1:
                i += 1
                # Also extract immediate lead blockquote as summary if not a callout
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
                    summary_collected = True
                    # Skip immediate horizontal rule after lead quote
                    while i < len(lines) and lines[i].strip() == "":
                        i += 1
                    if i < len(lines) and re.match(r"^(?:---+|\*\*\*+|___+)\s*$", lines[i].strip()):
                        i += 1
                continue

        fence_match = FENCE_OPEN_RE.match(stripped)
        if fence_match:
            fence_token = fence_match.group(1)
            lang = (fence_match.group(2) or "").lower()
            if lang == "mermaid" and len(fence_token) == 3:
                block_lines: list[str] = []
                i += 1
                while i < len(lines) and not re.match(
                    rf"^({re.escape(fence_token[0])}{{3,}})\s*$", lines[i].strip()
                ):
                    block_lines.append(lines[i])
                    i += 1
                if i < len(lines):
                    i += 1
                normalized_mmd = normalize_mermaid_code("\n".join(block_lines))
                escaped = html_lib.escape(normalized_mmd)
                out_chunks.append(
                    stash_html(f'<div class="diagram-container"><pre class="mermaid">{escaped}</pre></div>')
                )
                continue
            else:
                in_outer_fence = True
                outer_fence_char = fence_token[0]
                outer_fence_len = len(fence_token)
                out_chunks.append(line)
                i += 1
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
                        flowchart: { htmlLabels: true, curve: 'basis', padding: 14, nodeSpacing: 28, rankSpacing: 34 },
                        themeVariables: {
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '13px',
                            primaryColor: '#eff6ff',
                            primaryTextColor: '#0f172a',
                            primaryBorderColor: '#1e40af',
                            lineColor: '#1e40af',
                            edgeLabelBackground: '#ffffff',
                            secondaryColor: '#f8fafc',
                            tertiaryColor: '#ffffff'
                        }
                    });
                    await mermaid.run({ querySelector: '.mermaid' });
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
            # Skip the short module index README.md when generating chapter PDFs
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
