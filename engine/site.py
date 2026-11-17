from __future__ import annotations

import argparse
import configparser
import hashlib
import html as html_lib
import json
import posixpath
import re
import shutil
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import markdown
import yaml

import build as engine_build

ENGINE_DIR = engine_build.ENGINE_DIR
ROOT_DIR = engine_build.ROOT_DIR
DOCS_DIR = engine_build.DOCS_DIR
REPOS_DIR = engine_build.REPOS_DIR
DIST_DIR = engine_build.DIST_DIR
CACHE_DIR = engine_build.CACHE_DIR
THEMES_DIR = engine_build.THEMES_DIR
WEB_SRC_DIR = ENGINE_DIR / "web"
SITE_OUT_DIR = DIST_DIR / "site"

BRAND_NAME = "Arquitetura de IA"
BRAND_TAGLINE = "LLMs, Orquestração, RAG, Infraestrutura, Governança e Ecossistema de Projetos"
GITHUB_REPO_URL = "https://github.com/matheusmaiadev/guia-arquitetura-ia"

PDFJS_VERSION = "3.11.174"
PDFJS_MAIN_URL = f"https://cdn.jsdelivr.net/npm/pdfjs-dist@{PDFJS_VERSION}/build/pdf.min.js"
PDFJS_WORKER_URL = f"https://cdn.jsdelivr.net/npm/pdfjs-dist@{PDFJS_VERSION}/build/pdf.worker.min.js"
PDFJS_CMAPS_URL = f"https://cdn.jsdelivr.net/npm/pdfjs-dist@{PDFJS_VERSION}/cmaps/"

PDFJS_MAIN_CACHE = CACHE_DIR / f"pdf-{PDFJS_VERSION}.min.js"
PDFJS_WORKER_CACHE = CACHE_DIR / f"pdf.worker-{PDFJS_VERSION}.min.js"

HEADING_TAG_RE = re.compile(r"<h([1-4])([^>]*)>(.*?)</h\1>", re.IGNORECASE | re.DOTALL)
HTML_TAG_STRIP_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")
HREF_ATTR_RE = re.compile(r'href="([^"]+)"')
FENCE_OPEN_RE = re.compile(r"^(`{3,}|~{3,})\s*([a-zA-Z0-9_-]*)\s*$")


def slugify(text: str) -> str:
    plain = html_lib.unescape(HTML_TAG_STRIP_RE.sub("", text)).strip().lower()
    norm = unicodedata.normalize("NFKD", plain)
    ascii_str = "".join(ch for ch in norm if not unicodedata.combining(ch))
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_str).strip("-")
    return slug or "secao"


def doc_storage_id(web_path: str) -> str:
    digest = hashlib.sha1(web_path.encode("utf-8")).hexdigest()[:12]
    safe = re.sub(r"[^a-zA-Z0-9_-]+", "_", web_path).strip("_")
    if len(safe) > 48:
        safe = safe[-48:]
    return f"{safe}-{digest}"


def format_bytes(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    kb = size_bytes / 1024
    if kb < 1024:
        return f"{kb:.0f} KB"
    mb = kb / 1024
    return f"{mb:.1f} MB"


def map_repo_md_to_web_path(repo_rel: str) -> str:
    if repo_rel == "README.md":
        return "README.md"
    if repo_rel.startswith("docs/"):
        return repo_rel[len("docs/") :]
    return repo_rel


def ensure_vendor_assets(assets_out: Path) -> dict[str, str]:
    assets_out.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    vendor_paths: dict[str, str] = {
        "mermaidJs": engine_build.MERMAID_CDN_URL,
        "pdfJs": PDFJS_MAIN_URL,
        "pdfWorkerJs": PDFJS_WORKER_URL,
        "pdfCmapsUrl": PDFJS_CMAPS_URL,
    }

    try:
        mermaid_cached = engine_build.ensure_mermaid_js()
        shutil.copy2(mermaid_cached, assets_out / "mermaid.min.js")
        vendor_paths["mermaidJs"] = "./assets/mermaid.min.js"
    except Exception as exc:
        print(f"  [aviso] Usando CDN para Mermaid ({exc})")

    try:
        if not PDFJS_MAIN_CACHE.exists():
            urllib.request.urlretrieve(PDFJS_MAIN_URL, PDFJS_MAIN_CACHE)
        if not PDFJS_WORKER_CACHE.exists():
            urllib.request.urlretrieve(PDFJS_WORKER_URL, PDFJS_WORKER_CACHE)
        shutil.copy2(PDFJS_MAIN_CACHE, assets_out / "pdf.min.js")
        shutil.copy2(PDFJS_WORKER_CACHE, assets_out / "pdf.worker.min.js")
        vendor_paths["pdfJs"] = "./assets/pdf.min.js"
        vendor_paths["pdfWorkerJs"] = "./assets/pdf.worker.min.js"
    except Exception as exc:
        print(f"  [aviso] Usando CDN para PDF.js ({exc})")

    return vendor_paths


def add_heading_ids_and_extract_outline(html_body: str) -> tuple[str, list[dict[str, Any]]]:
    used_counts: dict[str, int] = {}
    outline: list[dict[str, Any]] = []

    def replacer(match: re.Match[str]) -> str:
        level = int(match.group(1))
        attrs = match.group(2) or ""
        inner = match.group(3) or ""
        plain_text = WHITESPACE_RE.sub(
            " ", html_lib.unescape(HTML_TAG_STRIP_RE.sub("", inner))
        ).strip()

        existing_id_match = re.search(r'\bid="([^"]+)"', attrs)
        if existing_id_match:
            hid = existing_id_match.group(1)
            new_attrs = attrs
        else:
            base = slugify(plain_text)
            count = used_counts.get(base, 0)
            used_counts[base] = count + 1
            hid = base if count == 0 else f"{base}-{count + 1}"
            new_attrs = f'{attrs} id="{hid}"'

        if level <= 3 and plain_text:
            outline.append({"level": level, "id": hid, "text": plain_text})
        return f"<h{level}{new_attrs}>{inner}</h{level}>"

    updated = HEADING_TAG_RE.sub(replacer, html_body)
    return updated, outline


def html_to_search_text(html_body: str) -> str:
    without_mermaid = re.sub(
        r'<pre class="mermaid">.*?</pre>', " ", html_body, flags=re.DOTALL | re.IGNORECASE
    )
    without_tags = HTML_TAG_STRIP_RE.sub(" ", without_mermaid)
    unescaped = html_lib.unescape(without_tags)
    return WHITESPACE_RE.sub(" ", unescaped).strip()


def resolve_internal_href(
    raw_href: str,
    current_repo_rel: str,
    repo_to_web: dict[str, str],
    web_known_paths: set[str],
) -> tuple[str | None, str]:
    href = raw_href.strip()
    if not href or href.startswith(("http://", "https://", "mailto:", "tel:", "javascript:")):
        return None, ""

    if href.startswith("#"):
        return None, href[1:]

    fragment = ""
    if "#" in href:
        href_part, fragment = href.split("#", 1)
    else:
        href_part = href

    decoded = urllib.parse.unquote(href_part)

    if decoded.startswith("file://"):
        marker = f"/{ROOT_DIR.name}/"
        idx = decoded.find(marker)
        if idx != -1:
            candidate = decoded[idx + len(marker) :].strip("/")
        else:
            return None, ""
    else:
        base_dir = posixpath.dirname(current_repo_rel)
        joined = posixpath.join(base_dir, decoded) if base_dir else decoded
        candidate = posixpath.normpath(joined).lstrip("./")

    if candidate in repo_to_web:
        return repo_to_web[candidate], fragment

    if candidate in web_known_paths:
        return candidate, fragment

    readme_candidate = posixpath.join(candidate.rstrip("/"), "README.md")
    if readme_candidate in repo_to_web:
        return repo_to_web[readme_candidate], fragment
    if readme_candidate in web_known_paths:
        return readme_candidate, fragment

    return None, ""


def rewrite_html_links(
    html_body: str,
    current_repo_rel: str,
    repo_to_web: dict[str, str],
    web_known_paths: set[str],
) -> str:
    def replacer(match: re.Match[str]) -> str:
        raw_href = html_lib.unescape(match.group(1))
        if raw_href.startswith("#/"):
            web_target = raw_href[2:]
            frag = ""
            if "#" in web_target:
                web_target, frag = web_target.split("#", 1)
            frag_attr = f' data-doc-anchor="{html_lib.escape(frag)}"' if frag else ""
            return (
                f'href="{html_lib.escape(raw_href)}" '
                f'data-doc-link="{html_lib.escape(web_target)}"{frag_attr}'
            )

        if raw_href.startswith("#"):
            return f'href="{html_lib.escape(raw_href)}" data-anchor-link="{html_lib.escape(raw_href[1:])}"'

        resolved_web, fragment = resolve_internal_href(
            raw_href, current_repo_rel, repo_to_web, web_known_paths
        )
        if resolved_web:
            frag_attr = f' data-doc-anchor="{html_lib.escape(fragment)}"' if fragment else ""
            hash_url = f"#/{resolved_web}" + (f"#{fragment}" if fragment else "")
            return (
                f'href="{html_lib.escape(hash_url)}" '
                f'data-doc-link="{html_lib.escape(resolved_web)}"{frag_attr}'
            )

        if raw_href.startswith(("http://", "https://")):
            return f'href="{html_lib.escape(raw_href)}" target="_blank" rel="noopener noreferrer"'

        return f'href="{html_lib.escape(raw_href)}"'

    return HREF_ATTR_RE.sub(replacer, html_body)


def compile_general_markdown(md_path: Path) -> tuple[str, str]:
    raw_text = md_path.read_text(encoding="utf-8")
    meta, md_body = engine_build.parse_frontmatter(raw_text)
    processed_md, placeholders, ext_title, _ = engine_build.preprocess_markdown(
        md_body, strip_first_h1=False
    )

    title = str(meta.get("title") or ext_title or md_path.stem.replace("-", " ").title()).strip()
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

    wrapped = f'<article class="doc-general"><main class="doc-content">{body_html}</main></article>'
    return title, wrapped


def load_umbrella_repositories(repo_to_web: dict[str, str]) -> list[dict[str, Any]]:
    catalog_file = REPOS_DIR / "catalog.yaml"
    repos_by_id: dict[str, dict[str, Any]] = {}

    if catalog_file.exists():
        raw = yaml.safe_load(catalog_file.read_text(encoding="utf-8")) or {}
        for item in raw.get("repositories") or []:
            rid = str(item.get("id") or "").strip()
            if not rid:
                continue
            rel_doc = str(item.get("related_doc") or "").strip()
            repos_by_id[rid] = {
                "id": rid,
                "name": str(item.get("name") or rid),
                "category": str(item.get("category") or "Ecossistema"),
                "status": str(item.get("status") or "planned"),
                "githubUrl": str(item.get("github_url") or ""),
                "relatedDoc": repo_to_web.get(rel_doc, rel_doc),
                "localReadme": repo_to_web.get(f"repos/{rid}/README.md"),
                "description": str(item.get("description") or ""),
                "tags": list(item.get("tags") or []),
            }

    gitmodules_path = ROOT_DIR / ".gitmodules"
    if gitmodules_path.exists():
        cp = configparser.ConfigParser()
        try:
            cp.read(gitmodules_path, encoding="utf-8")
            for section in cp.sections():
                sub_path = cp.get(section, "path", fallback="").strip()
                sub_url = cp.get(section, "url", fallback="").strip()
                if sub_path.startswith("repos/"):
                    rid = sub_path.split("/", 1)[1].strip("/")
                    clean_url = re.sub(r"\.git$", "", sub_url)
                    local_readme = repo_to_web.get(f"repos/{rid}/README.md")
                    if rid in repos_by_id:
                        repos_by_id[rid]["status"] = "submodule"
                        if clean_url:
                            repos_by_id[rid]["githubUrl"] = clean_url
                        if local_readme:
                            repos_by_id[rid]["localReadme"] = local_readme
                    else:
                        repos_by_id[rid] = {
                            "id": rid,
                            "name": rid.replace("-", " ").title(),
                            "category": "Submódulo Git",
                            "status": "submodule",
                            "githubUrl": clean_url,
                            "relatedDoc": "",
                            "localReadme": local_readme,
                            "description": f"Submódulo Git acoplado em {sub_path}.",
                            "tags": ["submodule"],
                        }
        except Exception:
            pass

    if REPOS_DIR.exists():
        for child in sorted(REPOS_DIR.iterdir()):
            if child.is_dir() and not child.name.startswith("."):
                rid = child.name
                local_readme = repo_to_web.get(f"repos/{rid}/README.md")
                if rid in repos_by_id and local_readme:
                    repos_by_id[rid]["localReadme"] = local_readme
                    if repos_by_id[rid]["status"] == "planned":
                        repos_by_id[rid]["status"] = "submodule"

    return list(repos_by_id.values())


def insert_into_tree(
    root_children: list[dict[str, Any]],
    web_path: str,
    node_meta: dict[str, Any],
) -> None:
    parts = web_path.split("/")
    current = root_children
    accum: list[str] = []

    for folder in parts[:-1]:
        accum.append(folder)
        folder_path = "/".join(accum)
        existing = next(
            (item for item in current if item["kind"] == "dir" and item["name"] == folder),
            None,
        )
        if existing is None:
            existing = {
                "kind": "dir",
                "name": folder,
                "path": folder_path,
                "children": [],
            }
            current.append(existing)
        current = existing["children"]

    current.append(
        {
            **node_meta,
            "kind": "file",
            "name": parts[-1],
            "path": web_path,
        }
    )


def sort_tree(nodes: list[dict[str, Any]], depth: int = 0) -> int:
    def sort_key(item: dict[str, Any]) -> tuple[int, int, str, int]:
        name_lower = item["name"].lower()
        if depth == 0 and item["kind"] == "file" and name_lower == "readme.md":
            return (-2, 0, name_lower, 0)
        if depth == 0 and item["kind"] == "dir" and name_lower == "00-cadernos-pdf":
            return (-1, 0, name_lower, 0)
        if depth == 0 and item["kind"] == "dir" and name_lower == "repos":
            return (0, 1, "99-repos", 0)

        is_file = 1 if item["kind"] == "file" else 0
        is_not_readme = 0 if (is_file and name_lower == "readme.md") else 1
        stem = name_lower.rsplit(".", 1)[0] if is_file and "." in name_lower else name_lower
        ext_rank = 0 if name_lower.endswith(".md") else 1
        return (is_file, is_not_readme, stem, ext_rank)

    nodes.sort(key=sort_key)
    total_files = 0
    for node in nodes:
        if node["kind"] == "dir":
            count = sort_tree(node["children"], depth + 1)
            node["fileCount"] = count
            total_files += count
        else:
            total_files += 1
    return total_files


def build_study_modules_catalog(
    items_manifest: dict[str, dict[str, Any]],
    module_pdf_by_slug: dict[str, str],
) -> list[dict[str, Any]]:
    modules: list[dict[str, Any]] = []
    for mod_slug, mod_info in engine_build.MODULES_META.items():
        mod_docs: list[dict[str, Any]] = []
        for path, meta in sorted(items_manifest.items()):
            if not path.startswith(f"{mod_slug}/") or meta.get("type") != "md":
                continue
            rel_in_mod = path[len(mod_slug) + 1 :]
            if rel_in_mod == "README.md":
                continue
            code = rel_in_mod.split("-")[0] if "-" in rel_in_mod else "DOC"
            if "/" in rel_in_mod:
                sub_parts = rel_in_mod.split("/")
                if sub_parts[-1] == "README.md":
                    code = sub_parts[0].split("-")[0] + "★"
                else:
                    code = f"{sub_parts[0].split('-')[0]}.{sub_parts[-1].split('-')[0]}"
            mod_docs.append(
                {
                    "code": code,
                    "title": meta.get("title") or rel_in_mod,
                    "path": path,
                    "pdfPath": meta.get("pairedPdf"),
                    "relPath": rel_in_mod,
                }
            )
        modules.append(
            {
                "id": mod_slug,
                "title": mod_info["title"],
                "subtitle": mod_info["subtitle"],
                "badge": mod_info["badge"],
                "readmePath": f"{mod_slug}/README.md" if f"{mod_slug}/README.md" in items_manifest else None,
                "notebookPdfPath": module_pdf_by_slug.get(mod_slug),
                "docs": mod_docs,
            }
        )
    return modules


def generate_site(theme_name: str = "default") -> Path:
    SITE_OUT_DIR.mkdir(parents=True, exist_ok=True)
    for child in SITE_OUT_DIR.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()

    assets_dir = SITE_OUT_DIR / "assets"
    data_dir = SITE_OUT_DIR / "data"
    docs_data_dir = data_dir / "docs"
    files_out_dir = SITE_OUT_DIR / "files"

    for d in (assets_dir, data_dir, docs_data_dir, files_out_dir):
        d.mkdir(parents=True, exist_ok=True)

    (SITE_OUT_DIR / ".nojekyll").write_text("", encoding="utf-8")

    for filename in ("index.html", "vscode.css", "app.js", "logo.svg"):
        src = WEB_SRC_DIR / filename
        if not src.exists():
            raise FileNotFoundError(f"Arquivo da interface web não encontrado: {src}")
        shutil.copy2(src, SITE_OUT_DIR / filename)

    theme_css = engine_build.load_theme_css(theme_name)
    shadow_ready_css = re.sub(r":root\b", ":host, :root", theme_css)
    (assets_dir / "editorial-theme.css").write_text(shadow_ready_css, encoding="utf-8")
    vendor_paths = ensure_vendor_assets(assets_dir)

    md_files: list[Path] = []
    root_readme = ROOT_DIR / "README.md"
    if root_readme.is_file():
        md_files.append(root_readme)
    for folder in (DOCS_DIR, REPOS_DIR):
        if folder.exists():
            md_files.extend(sorted(folder.rglob("*.md")))

    repo_to_web: dict[str, str] = {}
    web_known_paths: set[str] = set()
    for p in md_files:
        repo_rel = p.relative_to(ROOT_DIR).as_posix()
        web_p = map_repo_md_to_web_path(repo_rel)
        repo_to_web[repo_rel] = web_p
        web_known_paths.add(web_p)

    # Discover and copy all generated PDFs in dist/ (topicos/ and modulos/)
    pdf_files: list[Path] = []
    if DIST_DIR.exists():
        for pdf in sorted(DIST_DIR.rglob("*.pdf")):
            if SITE_OUT_DIR in pdf.parents:
                continue
            pdf_files.append(pdf)

    logical_pdfs: dict[str, dict[str, Any]] = {}
    topic_pdf_by_md_web: dict[str, str] = {}
    module_pdf_by_slug: dict[str, str] = {}

    for pdf_path in pdf_files:
        rel_pdf = pdf_path.relative_to(ROOT_DIR).as_posix()
        dest_pdf = files_out_dir / rel_pdf
        dest_pdf.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(pdf_path, dest_pdf)

        file_url = f"./files/{rel_pdf}"
        size_bytes = pdf_path.stat().st_size
        rel_from_dist = pdf_path.relative_to(DIST_DIR).parts

        logical_pdf_path: str | None = None
        source_md_web: str | None = None
        base_title = pdf_path.stem.replace("-", " ").title()

        if len(rel_from_dist) >= 2 and rel_from_dist[0] == "topicos":
            candidate_repo_md = ("docs/" + "/".join(rel_from_dist[1:])).rsplit(".pdf", 1)[0] + ".md"
            if candidate_repo_md in repo_to_web:
                source_md_web = repo_to_web[candidate_repo_md]
                logical_pdf_path = source_md_web.rsplit(".md", 1)[0] + ".pdf"
                topic_pdf_by_md_web[source_md_web] = logical_pdf_path
                base_title = f"Apostila PDF — {pdf_path.stem}"
        elif len(rel_from_dist) == 2 and rel_from_dist[0] == "modulos":
            mod_slug = pdf_path.stem
            logical_pdf_path = f"00-cadernos-pdf/{mod_slug}.pdf"
            module_pdf_by_slug[mod_slug] = logical_pdf_path
            mod_info = engine_build.MODULES_META.get(mod_slug, {})
            base_title = mod_info.get("title") or base_title

        if not logical_pdf_path:
            continue

        repo_to_web[rel_pdf] = logical_pdf_path
        web_known_paths.add(logical_pdf_path)

        logical_pdfs[logical_pdf_path] = {
            "path": logical_pdf_path,
            "type": "pdf",
            "title": base_title,
            "fileUrl": file_url,
            "sizeLabel": format_bytes(size_bytes),
            "sourceMd": source_md_web,
        }

    items_manifest: dict[str, dict[str, Any]] = {}
    search_entries: list[dict[str, Any]] = []
    tree_root: list[dict[str, Any]] = []

    for logical_pdf_path, pdf_entry in sorted(logical_pdfs.items()):
        items_manifest[logical_pdf_path] = pdf_entry
        insert_into_tree(
            tree_root,
            logical_pdf_path,
            {
                "type": "pdf",
                "title": pdf_entry["title"],
                "sizeLabel": pdf_entry["sizeLabel"],
            },
        )
        search_entries.append(
            {
                "path": logical_pdf_path,
                "type": "pdf",
                "title": pdf_entry["title"],
                "headings": [],
                "text": f"{pdf_entry['title']} {logical_pdf_path} apostila caderno pdf",
            }
        )

    for md_path in md_files:
        repo_rel = md_path.relative_to(ROOT_DIR).as_posix()
        web_md = repo_to_web[repo_rel]
        doc_id = doc_storage_id(web_md)

        title_str, raw_html = compile_general_markdown(md_path)
        linked_html = rewrite_html_links(raw_html, repo_rel, repo_to_web, web_known_paths)
        final_html, outline = add_heading_ids_and_extract_outline(linked_html)
        paired_pdf = topic_pdf_by_md_web.get(web_md)

        if paired_pdf and paired_pdf in items_manifest:
            items_manifest[paired_pdf]["title"] = f"{title_str} (PDF)"

        doc_payload = {
            "path": web_md,
            "type": "md",
            "kind": "doc",
            "title": title_str,
            "html": final_html,
            "outline": outline,
        }
        (docs_data_dir / f"{doc_id}.json").write_text(
            json.dumps(doc_payload, ensure_ascii=False), encoding="utf-8"
        )

        items_manifest[web_md] = {
            "path": web_md,
            "type": "md",
            "kind": "doc",
            "docId": doc_id,
            "title": title_str,
            "pairedPdf": paired_pdf,
        }
        insert_into_tree(
            tree_root,
            web_md,
            {
                "type": "md",
                "kind": "doc",
                "title": title_str,
                "pairedPdf": paired_pdf,
            },
        )
        search_entries.append(
            {
                "path": web_md,
                "type": "md",
                "title": title_str,
                "headings": [h["text"] for h in outline],
                "text": html_to_search_text(final_html),
            }
        )

    umbrella_repos = load_umbrella_repositories(repo_to_web)
    study_modules = build_study_modules_catalog(items_manifest, module_pdf_by_slug)

    sort_tree(tree_root, depth=0)

    manifest = {
        "brandName": BRAND_NAME,
        "brandTagline": BRAND_TAGLINE,
        "githubRepoUrl": GITHUB_REPO_URL,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "defaultDoc": "README.md" if "README.md" in items_manifest else next(iter(items_manifest), ""),
        "vendor": vendor_paths,
        "contexts": [
            {
                "id": "geral",
                "label": "Trilha Completa (AWS / Cloud)",
                "description": "Arquitetura de IA do fundamento à produção com foco em AWS e nuvem.",
            }
        ],
        "aliases": repo_to_web,
        "tree": tree_root,
        "items": items_manifest,
        "catalog": {
            "modules": study_modules,
            "repositories": umbrella_repos,
            "reposReadmePath": "repos/README.md" if "repos/README.md" in items_manifest else None,
        },
    }

    (data_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (data_dir / "search.json").write_text(
        json.dumps(search_entries, ensure_ascii=False), encoding="utf-8"
    )

    print(
        f"[ok] Site '{BRAND_NAME}' gerado em {SITE_OUT_DIR.relative_to(ROOT_DIR)} "
        f"({len(md_files)} documentos .md, {len(logical_pdfs)} apostilas/cadernos .pdf, "
        f"{len(umbrella_repos)} módulos em repos/)"
    )
    return SITE_OUT_DIR


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Gerador do portal estático estilo VS Code para o Guia de Arquitetura de IA"
    )
    parser.add_argument("--theme", type=str, default="default", help="Tema editorial CSS")
    parser.add_argument(
        "--build-pdfs",
        action="store_true",
        help="Compila todos os PDFs (capítulos + cadernos de módulo) antes de empacotar o site",
    )
    args = parser.parse_args()
    if args.build_pdfs:
        engine_build.build_all_pdfs(theme_name=args.theme)
    generate_site(theme_name=args.theme)


if __name__ == "__main__":
    main()
