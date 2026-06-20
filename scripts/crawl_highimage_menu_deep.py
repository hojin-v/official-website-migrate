#!/usr/bin/env python3
"""Recrawl Highimage/HITS and organize content by legacy menu structure."""

from __future__ import annotations

import csv
import datetime as dt
import html as html_lib
import json
import os
import re
import shutil
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import scripts.crawl_highimage as base


OUT_DIR = Path("highimage-crawl-v2")
OLD_OUT_DIR = Path("highimage-crawl")
RAW_DIR = OUT_DIR / "raw"
HTML_DIR = RAW_DIR / "html"
API_DIR = RAW_DIR / "api"
ASSET_DIR = OUT_DIR / "assets"
SMART_QUOTE_TRANSLATION = str.maketrans(
    {
        "“": '"',
        "”": '"',
        "„": '"',
        "‟": '"',
        "″": '"',
        "‘": "'",
        "’": "'",
        "′": "'",
    }
)
HYBRID_META_KEYS = {
    "component",
    "id",
    "css_classes",
    "custom_css_classes",
    "custom_css_styles",
    "animation",
    "animation_time",
    "timeline_animation",
    "timeline_delay",
    "timeline_order",
    "column_width",
    "section_width",
    "vertical_row",
    "box_middle",
    "full_screen",
    "full_screen_height",
    "parallax",
    "bleed",
    "ken_burn",
    "bg_pos",
    "overlay",
    "white",
    "position",
    "scroll_top",
    "style",
    "alignment",
    "tag",
    "language",
    "settings",
}
HYBRID_TOP_META_KEYS = {
    "scripts",
    "css",
    "css_page",
    "template_setting",
    "template_setting_top",
    "page_setting",
}
HYBRID_TEXT_KEYS = {"title", "subtitle", "text", "editor_content", "caption", "description", "content"}
HYBRID_IMAGE_KEYS = {"image", "icon_image", "background_image", "bg_image", "src", "poster"}
HYBRID_LINK_KEYS = {"link", "url", "href", "button_link", "link_url"}
PRODUCT_NAV_LABELS = ("AUTOMATION SYSTEM", "VISION INSPECTION SYSTEM", "PACKING / DISTRIBUTION SYSTEM")


def configure_base_paths() -> None:
    base.OUT_DIR = OUT_DIR
    base.RAW_DIR = RAW_DIR
    base.HTML_DIR = HTML_DIR
    base.API_DIR = API_DIR
    base.ASSET_DIR = ASSET_DIR


def asset_relative_for_url(url: str) -> Path:
    url = url.replace("×", "x")
    parsed = urlparse(url)
    path = parsed.path.lstrip("/")
    if path.startswith("wp/"):
        path = path[3:]
    if not path:
        path = f"downloaded/{abs(hash(url))}.bin"
    return Path("assets") / path


def mirror_or_download_asset(url: str) -> tuple[str, str]:
    url = url.replace("×", "x")
    relative = asset_relative_for_url(url)
    new_path = OUT_DIR / relative
    old_path = OLD_OUT_DIR / relative
    new_path.parent.mkdir(parents=True, exist_ok=True)

    if new_path.exists() and new_path.stat().st_size > 0:
        return str(relative), "exists"

    if old_path.exists() and old_path.stat().st_size > 0:
        try:
            os.link(old_path, new_path)
            return str(relative), "linked-from-v1"
        except OSError:
            shutil.copy2(old_path, new_path)
            return str(relative), "copied-from-v1"

    try:
        base.write_bytes(new_path, base.fetch(url))
        time.sleep(0.03)
        return str(relative), "downloaded"
    except (HTTPError, URLError, TimeoutError, OSError, UnicodeEncodeError) as exc:
        fallback = find_asset_by_basename(relative.name, exclude=new_path)
        if fallback:
            try:
                os.link(fallback, new_path)
                return str(relative), f"recovered-from-basename:{fallback.relative_to(fallback.parents[3])}"
            except OSError:
                shutil.copy2(fallback, new_path)
                return str(relative), f"recovered-from-basename:{fallback.name}"
        return str(relative), f"failed: {exc}"


def find_asset_by_basename(name: str, exclude: Path | None = None) -> Path | None:
    if not name:
        return None
    for root in (ASSET_DIR, OLD_OUT_DIR / "assets"):
        if not root.exists():
            continue
        for candidate in root.rglob(name):
            if exclude and candidate.resolve() == exclude.resolve():
                continue
            if candidate.is_file() and candidate.stat().st_size > 0:
                return candidate
    return None


def parse_fragment(fragment: str, source_url: str) -> tuple[list[str], list[dict[str, str]], list[dict[str, str]]]:
    parser = base.PageContentParser(source_url)
    parser.feed(fragment)
    parser.flush()
    return (
        parser.text_blocks,
        base.to_plain_dict_images(base.dedupe_images(parser.images)),
        base.to_plain_dict_links(base.dedupe_links(parser.links)),
    )


def dedupe_text_blocks(blocks: list[str]) -> list[str]:
    result = []
    seen = set()
    for block in blocks:
        cleaned = base.clean_text(block)
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        result.append(cleaned)
    return result


def dedupe_plain_images(images: list[dict[str, str]]) -> list[dict[str, str]]:
    result = []
    seen = set()
    for image in images:
        url = image.get("url", "")
        if not url or url in seen:
            continue
        seen.add(url)
        result.append(image)
    return result


def dedupe_plain_links(links: list[dict[str, str]]) -> list[dict[str, str]]:
    result = []
    seen = set()
    for link in links:
        key = (link.get("label", ""), link.get("url", ""))
        if not key[1] or key in seen:
            continue
        seen.add(key)
        result.append(link)
    return result


def escape_controls_in_json_strings(value: str) -> str:
    result: list[str] = []
    in_string = False
    escaped = False
    for char in value:
        if not in_string:
            result.append(char)
            if char == '"':
                in_string = True
            continue
        if escaped:
            result.append(char)
            escaped = False
        elif char == "\\":
            result.append(char)
            escaped = True
        elif char == '"':
            result.append(char)
            in_string = False
        elif char == "\n":
            result.append("\\n")
        elif char == "\r":
            result.append("\\r")
        elif char == "\t":
            result.append("\\t")
        else:
            result.append(char)
    return "".join(result)


def decode_hybrid_payload(content_html: str) -> dict[str, Any] | None:
    text = html_lib.unescape(re.sub(r"<[^>]+>", "", content_html or "")).strip()
    if not text.startswith("{"):
        return None
    text = escape_controls_in_json_strings(text.translate(SMART_QUOTE_TRANSLATION))
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def decode_hex_html(value: str) -> str | None:
    compact = re.sub(r"\s+", "", value)
    if not compact or len(compact) % 2 or not re.fullmatch(r"[0-9A-Fa-f]+", compact):
        return None
    raw = bytes.fromhex(compact)
    for encoding in ("utf-16-be", "utf-16-le", "utf-8"):
        try:
            decoded = raw.decode(encoding)
        except UnicodeDecodeError:
            continue
        if "<" in decoded and ">" in decoded:
            return decoded
    return None


def image_ref_from_url(url: str, source_url: str, alt: str = "") -> dict[str, str] | None:
    cleaned = url.strip().split("|", 1)[0].strip().replace("×", "x")
    if not cleaned:
        return None
    normalized = base.normalize_url(cleaned, source_url)
    parsed = urlparse(normalized)
    if not parsed.scheme or not parsed.netloc:
        return None
    return {"url": normalized, "alt": base.clean_text(alt), "local_path": str(asset_relative_for_url(normalized))}


def image_refs_from_hybrid_value(value: str, source_url: str, alt: str = "") -> list[dict[str, str]]:
    images = []
    primary = image_ref_from_url(value, source_url, alt)
    if primary:
        images.append(primary)
    for match in re.findall(r"""(?:https?:)?//[^\s"'|)]+""", value):
        image = image_ref_from_url(match, source_url, alt)
        if image:
            images.append(image)
    return dedupe_plain_images(images)


def parse_hybrid_string(value: str, source_url: str, key: str) -> tuple[list[str], list[dict[str, str]], list[dict[str, str]]]:
    decoded_html = decode_hex_html(value) if key == "content" else None
    fragment = decoded_html if decoded_html is not None else value
    text, images, links = parse_fragment(fragment, source_url)
    if key == "content" and decoded_html is None and re.fullmatch(r"[0-9A-Fa-f\s]{80,}", value or ""):
        text = []
    return text, images, links


def extract_hybrid_parts(node: Any, source_url: str) -> tuple[list[str], list[dict[str, str]], list[dict[str, str]]]:
    text_blocks: list[str] = []
    images: list[dict[str, str]] = []
    links: list[dict[str, str]] = []

    def walk(value: Any, key: str = "") -> None:
        if isinstance(value, dict):
            for child_key, child_value in value.items():
                if child_key in HYBRID_TEXT_KEYS and isinstance(child_value, str):
                    child_text, child_images, child_links = parse_hybrid_string(child_value, source_url, child_key)
                    text_blocks.extend(child_text)
                    images.extend(child_images)
                    links.extend(child_links)
                elif child_key in HYBRID_IMAGE_KEYS and isinstance(child_value, str):
                    alt = str(value.get("alt", "") or value.get("title", "") or "")
                    images.extend(image_refs_from_hybrid_value(child_value, source_url, alt))
                elif child_key in HYBRID_LINK_KEYS and isinstance(child_value, str):
                    href = child_value.strip()
                    if href:
                        normalized = base.normalize_url(href, source_url)
                        if urlparse(normalized).scheme in {"http", "https", "mailto", "tel"}:
                            links.append({"label": base.clean_text(str(value.get("title", "") or "")), "url": normalized})
                elif isinstance(child_value, (dict, list)):
                    walk(child_value, child_key)
                elif child_key not in HYBRID_META_KEYS and isinstance(child_value, str):
                    continue
        elif isinstance(value, list):
            for child in value:
                walk(child, key)

    walk(node)
    return dedupe_text_blocks(text_blocks), dedupe_plain_images(images), dedupe_plain_links(links)


def make_section(section_id: str, title: str, text_blocks: list[str], images: list[dict[str, str]], links: list[dict[str, str]]) -> dict[str, Any]:
    section = {"id": section_id, "title": title, "text_blocks": text_blocks, "images": images, "links": links}
    joined = " ".join(text_blocks)
    if title == "PRODUCTS" and all(label in joined for label in PRODUCT_NAV_LABELS):
        section["section_type"] = "navigation"
    if section_id == "post_featured_image":
        section["section_type"] = "media"
    return section


def parse_hybrid_content(content_html: str, source_url: str) -> dict[str, Any] | None:
    payload = decode_hybrid_payload(content_html)
    if not payload:
        return None

    sections = []
    intro_text: list[str] = []
    intro_images: list[dict[str, str]] = []
    intro_links: list[dict[str, str]] = []
    consumed_keys = set()

    for key, value in payload.items():
        if key.startswith("section_"):
            text, images, links = extract_hybrid_parts(value, source_url)
            if not text and not images:
                continue
            title = next((item for item in text if len(item) <= 90), text[0] if text else key)
            sections.append(make_section(key, title, text, images, links))
            consumed_keys.add(key)

    for key, value in payload.items():
        if key in consumed_keys or key in HYBRID_TOP_META_KEYS:
            continue
        text, images, links = extract_hybrid_parts(value, source_url)
        if key == "main-title" and sections:
            intro_images.extend(images)
            intro_links.extend(links)
        elif key == "post_type_setting" and images:
            sections.append(make_section("post_featured_image", "Featured image", text, images, links))
        elif text or images:
            title = next((item for item in text if len(item) <= 90), text[0] if text else key)
            sections.append(make_section(key, title, text, images, links))
        else:
            intro_links.extend(links)

    if not sections and (intro_text or intro_images):
        sections.append(make_section("content", intro_text[0] if intro_text else "content", intro_text, intro_images, intro_links))

    text_blocks = dedupe_text_blocks(intro_text + [block for section in sections for block in section["text_blocks"]])
    images = dedupe_plain_images(intro_images + [image for section in sections for image in section["images"]])
    links = dedupe_plain_links(intro_links + [link for section in sections for link in section["links"]])
    return {"text_blocks": text_blocks, "images": images, "links": links, "sections": sections}


def split_sections(page_html: str, source_url: str) -> list[dict[str, Any]]:
    region = base.main_region(page_html)
    matches = list(re.finditer(r"""<div\s+id=["'](section_[^"']+)["'][^>]*class=["'][^"']*section-item[^"']*["'][^>]*>""", region, flags=re.I))
    if not matches:
        text, images, links = parse_fragment(region, source_url)
        return [{"id": "content", "title": text[0] if text else "", "text_blocks": text, "images": images, "links": links}]

    sections = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(region)
        fragment = region[start:end]
        text, images, links = parse_fragment(fragment, source_url)
        if not text and not images:
            continue
        title = next((item for item in text if len(item) <= 90), text[0] if text else "")
        sections.append(
            {
                "id": match.group(1),
                "title": title,
                "text_blocks": text,
                "images": images,
                "links": links,
            }
        )
    return sections


def page_id_from_url(url: str) -> int | None:
    parsed = urlparse(url)
    query_id = parse_qs(parsed.query).get("page_id")
    if query_id and query_id[0].isdigit():
        return int(query_id[0])
    return None


def normalize_url_for_match(url: str) -> str:
    parsed = urlparse(base.normalize_url(url))
    path = re.sub(r"/+$", "", parsed.path)
    return f"{parsed.netloc}{path}".lower()


def normalize_full_url_for_match(url: str) -> str:
    parsed = urlparse(base.normalize_url(url))
    path = re.sub(r"/+$", "", parsed.path)
    query = f"?{parsed.query}" if parsed.query else ""
    return f"{parsed.netloc}{path}{query}".lower()


def match_page(url: str, pages: list[dict[str, Any]]) -> dict[str, Any] | None:
    wanted_full = normalize_full_url_for_match(url)
    for page in pages:
        if normalize_full_url_for_match(page["source_url"]) == wanted_full:
            return page

    pid = page_id_from_url(url)
    if pid is not None:
        return next((page for page in pages if page["wordpress_id"] == pid), None)

    wanted = normalize_url_for_match(url)
    for page in pages:
        if normalize_url_for_match(page["source_url"]) == wanted:
            return page

    wanted_slug = re.sub(r"/+$", "", urlparse(url).path).split("/")[-1]
    if wanted_slug:
        for page in pages:
            if page["slug"] == wanted_slug:
                return page
    return None


def page_summary(page: dict[str, Any] | None) -> dict[str, Any] | None:
    if not page:
        return None
    summary = {
        "title": page["title"],
        "slug": page["slug"],
        "source_url": page["source_url"],
        "wordpress_id": page["wordpress_id"],
        "content_source": page.get("content_source", ""),
        "text_block_count": len(page["text_blocks"]),
        "section_count": len(page.get("sections", [])),
        "image_count": len(page["images"]),
    }
    if page.get("public_link_aliases"):
        summary["public_link_aliases"] = page["public_link_aliases"]
    return summary


def product_catalog(pages_by_slug: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    groups = [
        (
            "Automation System",
            "automated-system",
            [
                "fcbga-precision-auto-unloading-system",
                "substrate-split-merge",
                "assembly-tester",
                "protective-band-taping",
            ],
        ),
        (
            "Vision Inspection System",
            "vision-system",
            [
                "human-error-auto-detection",
                "ir-crack",
                "w-b-d-a",
                "package-inspection",
                "mold",
                "led-external-appearance",
                "panel-film-defect",
                "damaged-pixel",
                "glass-surface",
                "lcd-panel",
                "secondary-cell-battery",
            ],
        ),
        (
            "Packing / Distribution System",
            "packing-distribution-system",
            [
                "inline-tray-auto-packing-system",
                "inline-reel-auto-packing-system",
            ],
        ),
    ]

    catalog = []
    for group, overview_slug, slugs in groups:
        catalog.append(
            {
                "group": group,
                "overview_page": page_summary(pages_by_slug.get(overview_slug)),
                "detail_pages": [page_summary(pages_by_slug[slug]) for slug in slugs if slug in pages_by_slug],
            }
        )
    return catalog


def build_navigation_tree(menu: list[dict[str, Any]], pages: list[dict[str, Any]], posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    pages_by_slug = {page["slug"]: page for page in pages}
    pages_by_parent: dict[int, list[dict[str, Any]]] = {}
    for page in pages:
        pages_by_parent.setdefault(page.get("parent", 0), []).append(page)

    tree = []
    for item in menu:
        page = match_page(item["url"], pages)
        node = {
            "label": item["label"],
            "url": item["url"],
            "page": page_summary(page),
            "children": [],
            "extra_pages": [],
        }
        child_ids = set()
        for child in item.get("children", []):
            child_page = match_page(child["url"], pages)
            if item["label"] == "PRODUCTS":
                explicit_product_pages = {
                    "Automation System": "automated-system",
                    "Vision Inspection System": "vision-system",
                    "Packing/Distribution System": "packing-distribution-system",
                }
                if child["label"] in explicit_product_pages:
                    child_page = pages_by_slug.get(explicit_product_pages[child["label"]], child_page)
            if child_page:
                child_ids.add(child_page["wordpress_id"])
            child_node = {
                "label": child["label"],
                "url": child["url"],
                "page": page_summary(child_page),
                "children": [],
            }
            if child["label"] == "Automation System":
                child_node["children"] = product_catalog(pages_by_slug)[0]["detail_pages"]
            elif child["label"] == "Vision Inspection System":
                child_node["children"] = product_catalog(pages_by_slug)[1]["detail_pages"]
            elif child["label"] == "Packing/Distribution System":
                child_node["children"] = product_catalog(pages_by_slug)[2]["detail_pages"]
            node["children"].append(child_node)

        if item["label"] == "COMPANY":
            company_parent = pages_by_slug.get("http-hitcorp1-cafe24-com-wp-http-hitcorp1-cafe24-com-wp-page_id2308-ceo-greeting")
            parent_id = company_parent["wordpress_id"] if company_parent else None
            extras = [
                page
                for page in pages_by_parent.get(parent_id, [])
                if page["wordpress_id"] not in child_ids and page["slug"] != "http-hitcorp1-cafe24-com-wp-http-hitcorp1-cafe24-com-wp-page_id2308-ceo-greeting"
            ]
            node["extra_pages"] = [page_summary(page) for page in extras]

        if item["label"] == "PRODUCTS":
            node["product_catalog"] = product_catalog(pages_by_slug)

        if item["label"] == "PR Center":
            hits_news = pages_by_slug.get("hits-news")
            if hits_news:
                node["extra_pages"] = [page_summary(hits_news)]
                node["news_index"] = page_summary(hits_news)
            node["posts"] = [page_summary(post) for post in posts]

        tree.append(node)
    return tree


def clean_entry_excerpt(entry: dict[str, Any]) -> str:
    rendered = entry.get("excerpt", {}).get("rendered", "")
    if not rendered:
        return ""
    if decode_hybrid_payload(rendered):
        return ""
    cleaned = base.clean_markup(rendered)
    if cleaned.startswith("{") and "component" in cleaned:
        return ""
    return cleaned


def mark_public_link_aliases(items: list[dict[str, Any]]) -> None:
    by_url: dict[str, list[dict[str, Any]]] = {}
    for item in items:
        by_url.setdefault(item["source_url"], []).append(item)
    for group in by_url.values():
        if len(group) <= 1:
            continue
        aliases = [
            {"title": item["title"], "slug": item["slug"], "wordpress_id": item["wordpress_id"]}
            for item in group
        ]
        for item in group:
            item["public_link_aliases"] = aliases


def process_entry(entry: dict[str, Any], kind: str) -> dict[str, Any]:
    slug = entry.get("slug") or f"{kind}-{entry['id']}"
    raw_name = f"{kind}-{entry['id']}-{base.safe_slug(slug, str(entry['id']))}.html"
    page_html = base.fetch_text(entry["link"])
    base.write_text(HTML_DIR / raw_name, page_html)
    hybrid = parse_hybrid_content(entry.get("content", {}).get("rendered", ""), entry["link"])
    if hybrid:
        text_blocks = hybrid["text_blocks"]
        images = hybrid["images"]
        links = hybrid["links"]
        sections = hybrid["sections"]
        content_source = "wp_rest_hybrid_content"
    else:
        text_blocks, image_refs, link_refs = base.parse_page_content(page_html, entry["link"])
        images = base.to_plain_dict_images(image_refs)
        links = base.to_plain_dict_links(link_refs)
        sections = split_sections(page_html, entry["link"])
        content_source = "public_rendered_html"
    return {
        "kind": kind,
        "wordpress_id": entry["id"],
        "title": base.clean_markup(entry.get("title", {}).get("rendered", "")),
        "slug": slug,
        "source_url": entry["link"],
        "content_source": content_source,
        "parent": entry.get("parent", 0),
        "date": entry.get("date", ""),
        "modified": entry.get("modified", ""),
        "excerpt": clean_entry_excerpt(entry),
        "text_blocks": text_blocks,
        "sections": sections,
        "images": images,
        "links": links,
    }


def collect_image_urls(items: list[dict[str, Any]], media_items: list[dict[str, Any]], html_blobs: list[str]) -> set[str]:
    urls: set[str] = set()
    for html in html_blobs:
        urls.update(base.extract_urls_from_html(html, base.WP_URL))
    for item in items:
        for image in item.get("images", []):
            urls.add(image["url"])
        for section in item.get("sections", []):
            for image in section.get("images", []):
                urls.add(image["url"])
    for media in media_items:
        if media.get("source_url") and base.is_image_url(media["source_url"]):
            urls.add(media["source_url"])
        for size in media.get("media_details", {}).get("sizes", {}).values():
            if size.get("source_url") and base.is_image_url(size["source_url"]):
                urls.add(size["source_url"])
    return urls


def rewrite_local_paths(items: list[dict[str, Any]]) -> None:
    for item in items:
        for image in item.get("images", []):
            image["local_path"] = str(asset_relative_for_url(image["url"]))
        for section in item.get("sections", []):
            for image in section.get("images", []):
                image["local_path"] = str(asset_relative_for_url(image["url"]))


def section_folder_for_page(page: dict[str, Any], nav_tree: list[dict[str, Any]]) -> str:
    slug = page["slug"]
    if slug == "home":
        return "00-home"
    for top in nav_tree:
        top_slug = base.safe_slug(top["label"], "section")
        if top.get("page", {}).get("slug") == slug:
            return f"01-menu/{top_slug}"
        for child in top.get("children", []):
            if child.get("page", {}).get("slug") == slug:
                return f"01-menu/{top_slug}"
            for grandchild in child.get("children", []):
                if grandchild and grandchild.get("slug") == slug:
                    return f"01-menu/{top_slug}/product-details"
        for extra in top.get("extra_pages", []):
            if extra and extra.get("slug") == slug:
                return f"01-menu/{top_slug}/extra"
    return "02-other-pages"


def markdown_page(item: dict[str, Any]) -> str:
    lines = [
        "---",
        f"title: {json.dumps(item['title'], ensure_ascii=False)}",
        f"slug: {json.dumps(item['slug'], ensure_ascii=False)}",
        f"source_url: {json.dumps(item['source_url'], ensure_ascii=False)}",
        f"wordpress_id: {item['wordpress_id']}",
        f"kind: {json.dumps(item['kind'], ensure_ascii=False)}",
    ]
    if item.get("content_source"):
        lines.append(f"content_source: {json.dumps(item['content_source'], ensure_ascii=False)}")
    if item.get("public_link_aliases"):
        lines.append(f"public_link_aliases: {json.dumps(item['public_link_aliases'], ensure_ascii=False)}")
    if item.get("date"):
        lines.append(f"date: {json.dumps(item['date'], ensure_ascii=False)}")
    lines.extend(["---", "", f"# {item['title']}", ""])
    if item.get("excerpt"):
        lines.extend(["## Excerpt", item["excerpt"], ""])
    lines.append("## Sections")
    for index, section in enumerate(item.get("sections", []), 1):
        lines.append("")
        title = section.get("title") or section.get("id")
        if section.get("section_type"):
            title = f"{title} [{section['section_type']}]"
        lines.append(f"### {index}. {title}")
        for block in section.get("text_blocks", []):
            lines.append(f"- {block}")
        for image in section.get("images", []):
            lines.append(f"- image: `{image.get('local_path')}` | {image.get('url')} | alt: {image.get('alt', '')}")
    lines.extend(["", "## All Text Blocks"])
    for block in item.get("text_blocks", []):
        lines.append(f"- {block}")
    if item.get("links"):
        lines.extend(["", "## Links"])
        for link in item["links"]:
            lines.append(f"- {link.get('label')}: {link.get('url')}")
    return "\n".join(lines) + "\n"


def write_markdown_files(pages: list[dict[str, Any]], posts: list[dict[str, Any]], nav_tree: list[dict[str, Any]]) -> None:
    for page in pages:
        folder = OUT_DIR / "content-by-menu" / section_folder_for_page(page, nav_tree)
        filename = f"{base.safe_slug(page['slug'], str(page['wordpress_id']))}.md"
        base.write_text(folder / filename, markdown_page(page))
    for post in posts:
        folder = OUT_DIR / "content-by-menu" / "01-menu/pr-center/posts"
        date_prefix = post["date"][:10] if post.get("date") else "undated"
        filename = f"{date_prefix}-post-{post['wordpress_id']}.md"
        base.write_text(folder / filename, markdown_page(post))


def write_site_map(nav_tree: list[dict[str, Any]], pages: list[dict[str, Any]], posts: list[dict[str, Any]]) -> None:
    lines = [
        "# Highimage / HITS Menu Deep Crawl",
        "",
        f"- Public URL: {base.PUBLIC_URL}",
        f"- Actual WordPress URL: {base.WP_URL}",
        f"- Crawled at: {dt.datetime.now(dt.timezone.utc).isoformat()}",
        f"- Pages: {len(pages)}",
        f"- Posts: {len(posts)}",
        "",
        "## Legacy Menu Tree",
        "",
    ]
    for top in nav_tree:
        lines.append(f"- {top['label']}")
        if top.get("page"):
            lines.append(f"  - page: {top['page']['title']} (`{top['page']['slug']}`)")
        for child in top.get("children", []):
            lines.append(f"  - {child['label']}")
            if child.get("page"):
                lines.append(f"    - page: {child['page']['title']} (`{child['page']['slug']}`)")
            for grandchild in child.get("children", []):
                if grandchild:
                    lines.append(f"    - detail: {grandchild['title']} (`{grandchild['slug']}`)")
        for extra in top.get("extra_pages", []):
            if extra:
                lines.append(f"  - extra: {extra['title']} (`{extra['slug']}`)")
        for post in top.get("posts", []):
            if post:
                lines.append(f"  - post: {post['title']} (`{post['slug']}`)")
    lines.extend(
        [
            "",
            "## Output Files",
            "",
            "- `site-content.json`: full data grouped by menu, pages, posts, images.",
            "- `navigation-tree.json`: legacy menu tree with page mappings.",
            "- `content-by-menu/`: Markdown files arranged by menu/submenu.",
            "- `raw/`: freshly fetched API JSON and rendered HTML.",
            "- `assets/`: hard-linked/copied/downloaded image archive for this crawl.",
        ]
    )
    base.write_text(OUT_DIR / "README.md", "\n".join(lines) + "\n")
    base.write_text(OUT_DIR / "site-map.md", "\n".join(lines) + "\n")


def main() -> int:
    configure_base_paths()
    for generated_dir in (OUT_DIR / "content-by-menu", RAW_DIR):
        if generated_dir.exists():
            shutil.rmtree(generated_dir)
    OUT_DIR.mkdir(exist_ok=True)
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    API_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    frame_html = base.fetch_text(base.PUBLIC_URL)
    home_html = base.fetch_text(base.WP_URL)
    base.write_text(HTML_DIR / "www.highimage.co.kr-frame.html", frame_html)
    base.write_text(HTML_DIR / "wp-home.html", home_html)

    pages_api = base.fetch_api_collection("pages")
    posts_api = base.fetch_api_collection("posts")
    media_items = base.fetch_api_collection("media")
    categories = base.fetch_single_api("categories")
    tags = base.fetch_single_api("tags")

    pages = []
    for page in pages_api:
        processed = process_entry(page, "page")
        pages.append(processed)
        print(f"page {processed['wordpress_id']} {processed['title']}", file=sys.stderr)

    posts = []
    for post in posts_api:
        processed = process_entry(post, "post")
        processed["categories"] = [
            base.clean_markup(category.get("name", ""))
            for category in categories
            if category.get("id") in post.get("categories", [])
        ]
        processed["tags"] = [
            base.clean_markup(tag.get("name", ""))
            for tag in tags
            if tag.get("id") in post.get("tags", [])
        ]
        posts.append(processed)
        print(f"post {processed['wordpress_id']} {processed['title']}", file=sys.stderr)

    mark_public_link_aliases(pages)

    image_urls = collect_image_urls(pages + posts, media_items, [frame_html, home_html])
    image_manifest = []
    for url in sorted(image_urls):
        local_path, status = mirror_or_download_asset(url)
        image_manifest.append({"url": url, "local_path": local_path, "status": status})
        print(f"image {status} {url}", file=sys.stderr)

    rewrite_local_paths(pages + posts)

    menu = base.extract_main_menu(home_html)
    language_links = base.extract_language_links(home_html)
    nav_tree = build_navigation_tree(menu, pages, posts)
    pages_by_slug = {page["slug"]: page for page in pages}
    product_groups = product_catalog(pages_by_slug)
    contact = base.collect_contact([block for item in pages + posts for block in item["text_blocks"]])

    data = {
        "source": {
            "public_url": base.PUBLIC_URL,
            "actual_wordpress_url": base.WP_URL,
            "crawl_date": dt.datetime.now(dt.timezone.utc).isoformat(),
            "scope": "Korean site content organized by legacy menu and submenu.",
        },
        "language_links": language_links,
        "contact": contact,
        "navigation_tree": nav_tree,
        "product_catalog": product_groups,
        "pages": pages,
        "posts": posts,
        "images": image_manifest,
    }
    base.write_text(OUT_DIR / "site-content.json", json.dumps(data, ensure_ascii=False, indent=2))
    base.write_text(OUT_DIR / "navigation-tree.json", json.dumps(nav_tree, ensure_ascii=False, indent=2))
    base.write_text(OUT_DIR / "product-catalog.json", json.dumps(product_groups, ensure_ascii=False, indent=2))

    with (OUT_DIR / "image-manifest.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["url", "local_path", "status"])
        writer.writeheader()
        writer.writerows(image_manifest)

    write_markdown_files(pages, posts, nav_tree)
    write_site_map(nav_tree, pages, posts)

    print(
        json.dumps(
            {
                "pages": len(pages),
                "posts": len(posts),
                "images": len(image_manifest),
                "top_menu_items": len(nav_tree),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
