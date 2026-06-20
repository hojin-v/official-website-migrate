#!/usr/bin/env python3
"""Crawl the legacy HITS/Highimage WordPress site into migration assets."""

from __future__ import annotations

import csv
import datetime as dt
import html as html_lib
import json
import mimetypes
import os
import re
import sys
import time
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


PUBLIC_URL = "http://www.highimage.co.kr/"
WP_URL = "http://hitcorp1.cafe24.com/wp/"
USER_AGENT = "Mozilla/5.0 (compatible; highimage-migration-crawler/1.0)"
OUT_DIR = Path("highimage-crawl")
RAW_DIR = OUT_DIR / "raw"
HTML_DIR = RAW_DIR / "html"
API_DIR = RAW_DIR / "api"
ASSET_DIR = OUT_DIR / "assets"

BLOCK_TAGS = {
    "address",
    "article",
    "aside",
    "blockquote",
    "br",
    "dd",
    "div",
    "dl",
    "dt",
    "figcaption",
    "figure",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "li",
    "ol",
    "p",
    "section",
    "table",
    "td",
    "th",
    "tr",
    "ul",
}

SKIP_TAGS = {"script", "style", "noscript", "svg"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico"}
TOP_LEVEL_MENU = {"HOME", "COMPANY", "PRODUCTS", "RND", "PR Center"}


def fetch(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as response:
        return response.read()


def fetch_text(url: str) -> str:
    data = fetch(url)
    return data.decode("utf-8", errors="replace")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def clean_text(value: str) -> str:
    value = html_lib.unescape(value)
    value = value.replace("\xa0", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def clean_markup(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    return clean_text(value)


def safe_slug(value: str, fallback: str) -> str:
    value = value or fallback
    value = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-").lower()
    return value or fallback


def is_image_url(url: str) -> bool:
    path = urlparse(url).path.lower()
    ext = os.path.splitext(path)[1]
    return ext in IMAGE_EXTENSIONS


def normalize_url(url: str, base: str = WP_URL) -> str:
    if not url:
        return ""
    url = html_lib.unescape(url.strip().strip("\"'"))
    if url.startswith("//"):
        url = "http:" + url
    return urljoin(base, url)


def main_region(page_html: str) -> str:
    lower = page_html.lower()
    start = lower.find("</header>")
    start = start + len("</header>") if start != -1 else 0
    end_candidates = [
        pos
        for pos in (
            lower.find("<footer", start),
            lower.find('<div class="wpfm-menu-wrapper"', start),
        )
        if pos != -1
    ]
    end = min(end_candidates) if end_candidates else len(page_html)
    return page_html[start:end]


def extract_image_urls_from_srcset(srcset: str, base: str = WP_URL) -> list[str]:
    urls = []
    for item in srcset.split(","):
        candidate = item.strip().split(" ")[0]
        if candidate:
            urls.append(normalize_url(candidate, base))
    return urls


def extract_urls_from_html(page_html: str, base: str = WP_URL) -> set[str]:
    urls: set[str] = set()
    patterns = [
        r"""(?:src|data-src|data-lazy-src|poster)=["']([^"']+)["']""",
        r"""url\(["']?([^)"']+)["']?\)""",
    ]
    for pattern in patterns:
        for match in re.findall(pattern, page_html, flags=re.I):
            url = normalize_url(match, base)
            if is_image_url(url):
                urls.add(url)
    for srcset in re.findall(r"""srcset=["']([^"']+)["']""", page_html, flags=re.I):
        for url in extract_image_urls_from_srcset(srcset, base):
            if is_image_url(url):
                urls.add(url)
    return urls


@dataclass
class ImageRef:
    url: str
    alt: str = ""
    local_path: str = ""


@dataclass
class LinkRef:
    label: str
    url: str


class PageContentParser(HTMLParser):
    def __init__(self, base_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self.base_url = base_url
        self.skip_depth = 0
        self.buffer: list[str] = []
        self.text_blocks: list[str] = []
        self.images: list[ImageRef] = []
        self.links: list[LinkRef] = []
        self._link_stack: list[dict[str, Any]] = []

    def flush(self) -> None:
        text = clean_text(" ".join(self.buffer))
        self.buffer = []
        if not text:
            return
        if self.text_blocks and self.text_blocks[-1] == text:
            return
        self.text_blocks.append(text)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        if tag in SKIP_TAGS:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        if tag in BLOCK_TAGS:
            self.flush()
        style = attrs_dict.get("style", "")
        for match in re.findall(r"""url\(["']?([^)"']+)["']?\)""", style, flags=re.I):
            url = normalize_url(match, self.base_url)
            if is_image_url(url):
                self.images.append(ImageRef(url=url))
        if tag == "img":
            src = attrs_dict.get("src") or attrs_dict.get("data-src") or attrs_dict.get("data-lazy-src")
            if src:
                self.images.append(ImageRef(url=normalize_url(src, self.base_url), alt=clean_text(attrs_dict.get("alt", ""))))
            if attrs_dict.get("srcset"):
                for url in extract_image_urls_from_srcset(attrs_dict["srcset"], self.base_url):
                    if is_image_url(url):
                        self.images.append(ImageRef(url=url, alt=clean_text(attrs_dict.get("alt", ""))))
        if tag == "a" and attrs_dict.get("href"):
            self._link_stack.append({"href": normalize_url(attrs_dict["href"], self.base_url), "text": []})

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1
            return
        if self.skip_depth:
            return
        if tag == "a" and self._link_stack:
            link = self._link_stack.pop()
            label = clean_text(" ".join(link["text"]))
            self.links.append(LinkRef(label=label, url=link["href"]))
        if tag in BLOCK_TAGS:
            self.flush()

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        text = clean_text(data)
        if not text:
            return
        self.buffer.append(text)
        for link in self._link_stack:
            link["text"].append(text)


def parse_page_content(page_html: str, base_url: str) -> tuple[list[str], list[ImageRef], list[LinkRef]]:
    parser = PageContentParser(base_url)
    parser.feed(main_region(page_html))
    parser.flush()
    images = dedupe_images(parser.images)
    links = dedupe_links(parser.links)
    return parser.text_blocks, images, links


def dedupe_images(images: list[ImageRef]) -> list[ImageRef]:
    seen = set()
    result = []
    for image in images:
        if not image.url or image.url in seen:
            continue
        seen.add(image.url)
        result.append(image)
    return result


def dedupe_links(links: list[LinkRef]) -> list[LinkRef]:
    seen = set()
    result = []
    for link in links:
        key = (link.label, link.url)
        if not link.url or key in seen:
            continue
        seen.add(key)
        result.append(link)
    return result


def extract_nav_html(page_html: str) -> str:
    start = page_html.find('id="hc-inner-menu"')
    if start == -1:
        start = page_html.find("id='hc-inner-menu'")
    if start == -1:
        return ""
    ul_start = page_html.rfind("<ul", 0, start)
    end_marker = '<div class="custom-area"'
    end = page_html.find(end_marker, start)
    if end == -1:
        end = page_html.find("</nav>", start)
    return page_html[ul_start:end] if ul_start != -1 and end != -1 else ""


def extract_anchor_sequence(fragment: str) -> list[dict[str, str]]:
    anchors = []
    for match in re.finditer(r"""<a([^>]*)href=["']([^"']+)["']([^>]*)>(.*?)</a>""", fragment, flags=re.I | re.S):
        attrs = (match.group(1) + " " + match.group(3)).lower()
        label = clean_markup(match.group(4)).replace(" ", " ").strip()
        label = label.replace("caret", "").strip()
        anchors.append(
            {
                "label": label,
                "url": normalize_url(match.group(2)),
                "is_parent": "dropdown-toggle" in attrs,
            }
        )
    return anchors


def extract_main_menu(page_html: str) -> list[dict[str, Any]]:
    anchors = extract_anchor_sequence(extract_nav_html(page_html))
    menu: list[dict[str, Any]] = []
    i = 0
    while i < len(anchors):
        item = anchors[i]
        label = item["label"]
        if label in {"COMPANY", "PRODUCTS", "RND"}:
            children = []
            i += 1
            while i < len(anchors) and anchors[i]["label"] not in TOP_LEVEL_MENU:
                children.append({"label": anchors[i]["label"], "url": anchors[i]["url"]})
                i += 1
            menu.append({"label": label, "url": item["url"], "children": children})
        else:
            menu.append({"label": label, "url": item["url"], "children": []})
            i += 1
    return menu


def extract_language_links(page_html: str) -> list[dict[str, str]]:
    links = []
    match = re.search(r"""<div class=["']custom-area["']>(.*?)</div>""", page_html, flags=re.I | re.S)
    if not match:
        return links
    for anchor in extract_anchor_sequence(match.group(1)):
        links.append({"label": anchor["label"], "url": anchor["url"]})
    return links


def extract_product_catalog(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    slug_to_page = {page["slug"]: page for page in pages}
    groups = [
        (
            "Automation System",
            [
                "fcbga-precision-auto-unloading-system",
                "substrate-split-merge",
                "assembly-tester",
                "protective-band-taping",
            ],
        ),
        (
            "Vision Inspection System",
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
            [
                "inline-tray-auto-packing-system",
                "inline-reel-auto-packing-system",
            ],
        ),
    ]
    catalog = []
    for group_name, slugs in groups:
        items = []
        for slug in slugs:
            page = slug_to_page.get(slug)
            if not page:
                continue
            items.append(
                {
                    "title": clean_markup(page["title"]["rendered"]),
                    "slug": page["slug"],
                    "source_url": page["link"],
                    "wordpress_id": page["id"],
                }
            )
        catalog.append({"group": group_name, "items": items})
    return catalog


def fetch_api_collection(endpoint: str) -> list[dict[str, Any]]:
    all_items: list[dict[str, Any]] = []
    page = 1
    while True:
        url = f"{WP_URL}wp-json/wp/v2/{endpoint}?per_page=100&page={page}"
        try:
            data = fetch(url)
        except HTTPError as exc:
            if exc.code == 400 and page > 1:
                break
            raise
        API_DIR.mkdir(parents=True, exist_ok=True)
        (API_DIR / f"{endpoint}-page-{page}.json").write_bytes(data)
        items = json.loads(data.decode("utf-8"))
        if not isinstance(items, list) or not items:
            break
        all_items.extend(items)
        if len(items) < 100:
            break
        page += 1
    return all_items


def fetch_single_api(endpoint: str) -> Any:
    data = fetch(f"{WP_URL}wp-json/wp/v2/{endpoint}?per_page=100")
    API_DIR.mkdir(parents=True, exist_ok=True)
    (API_DIR / f"{endpoint}.json").write_bytes(data)
    return json.loads(data.decode("utf-8"))


def asset_path_for_url(url: str) -> Path:
    parsed = urlparse(url)
    path = parsed.path.lstrip("/")
    if path.startswith("wp/"):
        path = path[3:]
    if not path:
        guessed = mimetypes.guess_extension(parsed.path) or ".bin"
        path = f"downloaded/{abs(hash(url))}{guessed}"
    return ASSET_DIR / path


def local_path_for_url(url: str) -> str:
    return str(asset_path_for_url(url).relative_to(OUT_DIR))


def download_image(url: str) -> tuple[str, str]:
    local = asset_path_for_url(url)
    if local.exists() and local.stat().st_size > 0:
        return str(local.relative_to(OUT_DIR)), "exists"
    try:
        data = fetch(url)
        write_bytes(local, data)
        time.sleep(0.03)
        return str(local.relative_to(OUT_DIR)), "downloaded"
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        return str(local.relative_to(OUT_DIR)), f"failed: {exc}"


def image_metadata_from_media(media_items: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    metadata = {}
    for item in media_items:
        urls = []
        if item.get("source_url"):
            urls.append(item["source_url"])
        sizes = item.get("media_details", {}).get("sizes", {})
        for size in sizes.values():
            if size.get("source_url"):
                urls.append(size["source_url"])
        for url in urls:
            metadata[url] = {
                "wordpress_id": item.get("id"),
                "title": clean_markup(item.get("title", {}).get("rendered", "")),
                "alt": clean_text(item.get("alt_text", "")),
                "caption": clean_markup(item.get("caption", {}).get("rendered", "")),
                "description": clean_markup(item.get("description", {}).get("rendered", "")),
                "mime_type": item.get("mime_type", ""),
                "media_type": item.get("media_type", ""),
                "date": item.get("date", ""),
                "source_url": item.get("source_url", ""),
                "width": item.get("media_details", {}).get("width"),
                "height": item.get("media_details", {}).get("height"),
            }
    return metadata


def to_plain_dict_images(images: list[ImageRef]) -> list[dict[str, str]]:
    return [{"url": image.url, "alt": image.alt, "local_path": local_path_for_url(image.url)} for image in images]


def to_plain_dict_links(links: list[LinkRef]) -> list[dict[str, str]]:
    return [{"label": link.label, "url": link.url} for link in links]


def markdown_escape(text: str) -> str:
    return text.replace("\n", " ").strip()


def write_page_markdown(kind: str, item: dict[str, Any]) -> None:
    folder = OUT_DIR / kind
    filename = safe_slug(item.get("slug", ""), f"{kind}-{item['wordpress_id']}") + ".md"
    lines = [
        "---",
        f"title: {json.dumps(item['title'], ensure_ascii=False)}",
        f"slug: {item['slug']}",
        f"source_url: {item['source_url']}",
        f"wordpress_id: {item['wordpress_id']}",
    ]
    if item.get("date"):
        lines.append(f"date: {item['date']}")
    lines.extend(["---", ""])
    lines.append(f"# {item['title']}")
    lines.append("")
    lines.append("## Text")
    for block in item["text_blocks"]:
        lines.append(f"- {markdown_escape(block)}")
    if item["images"]:
        lines.append("")
        lines.append("## Images")
        for image in item["images"]:
            alt = image.get("alt") or ""
            lines.append(f"- `{image['local_path']}` | {image['url']} | alt: {alt}")
    if item["links"]:
        lines.append("")
        lines.append("## Links")
        for link in item["links"]:
            lines.append(f"- {link['label']}: {link['url']}")
    write_text(folder / filename, "\n".join(lines) + "\n")


def process_entry(entry: dict[str, Any], kind: str) -> dict[str, Any]:
    slug = entry.get("slug") or f"{kind}-{entry['id']}"
    raw_name = f"{kind}-{entry['id']}-{safe_slug(slug, str(entry['id']))}.html"
    page_html = fetch_text(entry["link"])
    write_text(HTML_DIR / raw_name, page_html)
    text_blocks, images, links = parse_page_content(page_html, entry["link"])
    return {
        "wordpress_id": entry["id"],
        "title": clean_markup(entry.get("title", {}).get("rendered", "")),
        "slug": slug,
        "source_url": entry["link"],
        "parent": entry.get("parent", 0),
        "date": entry.get("date", ""),
        "modified": entry.get("modified", ""),
        "excerpt": clean_markup(entry.get("excerpt", {}).get("rendered", "")),
        "text_blocks": text_blocks,
        "images": to_plain_dict_images(images),
        "links": to_plain_dict_links(links),
    }


def collect_contact(text_blocks: list[str]) -> dict[str, list[str]]:
    text = "\n".join(text_blocks)
    emails = sorted(set(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)))
    phone_matches = re.findall(
        r"(?:\(\+\d{1,3}\)|\+?\d{1,3})?\s*-?\s*\d{1,4}-\d{3,4}-\d{4}",
        text,
    )
    phones = []
    for phone in phone_matches:
        normalized = re.sub(r"\(\+(\d{1,3})\)", r"+\1", phone)
        normalized = re.sub(r"\s+", "", normalized)
        normalized = normalized.replace("+-", "+")
        normalized = normalized.replace("--", "-")
        if normalized and normalized not in phones:
            phones.append(normalized)
    phones = sorted(set(phones))
    return {"emails": emails, "phones": phones}


def main() -> int:
    OUT_DIR.mkdir(exist_ok=True)
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    API_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    frame_html = fetch_text(PUBLIC_URL)
    write_text(HTML_DIR / "www.highimage.co.kr-frame.html", frame_html)
    home_html = fetch_text(WP_URL)
    write_text(HTML_DIR / "wp-home.html", home_html)

    pages = fetch_api_collection("pages")
    posts = fetch_api_collection("posts")
    media_items = fetch_api_collection("media")
    categories = fetch_single_api("categories")
    tags = fetch_single_api("tags")

    menu = extract_main_menu(home_html)
    language_links = extract_language_links(home_html)
    product_catalog = extract_product_catalog(pages)
    media_metadata = image_metadata_from_media(media_items)

    site_image_urls = set(extract_urls_from_html(frame_html, PUBLIC_URL))
    site_image_urls.update(extract_urls_from_html(home_html, WP_URL))

    processed_pages = []
    for page in pages:
        processed = process_entry(page, "page")
        processed_pages.append(processed)
        for image in processed["images"]:
            site_image_urls.add(image["url"])
        print(f"page {page['id']} {processed['title']}", file=sys.stderr)

    processed_posts = []
    for post in posts:
        processed = process_entry(post, "post")
        processed["categories"] = [
            clean_markup(category.get("name", ""))
            for category in categories
            if category.get("id") in post.get("categories", [])
        ]
        processed["tags"] = [
            clean_markup(tag.get("name", ""))
            for tag in tags
            if tag.get("id") in post.get("tags", [])
        ]
        processed_posts.append(processed)
        for image in processed["images"]:
            site_image_urls.add(image["url"])
        print(f"post {post['id']} {processed['title']}", file=sys.stderr)

    for url in media_metadata:
        if is_image_url(url):
            site_image_urls.add(url)

    image_manifest = []
    for url in sorted(site_image_urls):
        if not is_image_url(url):
            continue
        local_path, status = download_image(url)
        meta = media_metadata.get(url, {})
        image_manifest.append(
            {
                "url": url,
                "local_path": local_path,
                "status": status,
                "wordpress_id": meta.get("wordpress_id", ""),
                "title": meta.get("title", ""),
                "alt": meta.get("alt", ""),
                "caption": meta.get("caption", ""),
                "mime_type": meta.get("mime_type", ""),
                "width": meta.get("width", ""),
                "height": meta.get("height", ""),
            }
        )
        print(f"image {status} {url}", file=sys.stderr)

    # Rewrite local paths in page/post image references after downloads.
    for item in processed_pages + processed_posts:
        for image in item["images"]:
            image["local_path"] = local_path_for_url(image["url"])

    for item in processed_pages:
        write_page_markdown("pages", item)
    for item in processed_posts:
        write_page_markdown("posts", item)

    all_text = []
    for item in processed_pages + processed_posts:
        all_text.extend(item["text_blocks"])
    contact = collect_contact(all_text)

    content = {
        "source": {
            "public_url": PUBLIC_URL,
            "actual_wordpress_url": WP_URL,
            "crawl_date": dt.datetime.now(dt.timezone.utc).isoformat(),
            "scope": "Korean site content from www.highimage.co.kr.",
            "note": "The public domain is a frameset that loads the Cafe24 WordPress site. ENG/CHN language links are recorded, but the separate language sites are not included in this crawl.",
        },
        "menu": menu,
        "language_links": language_links,
        "contact": contact,
        "product_catalog": product_catalog,
        "pages": processed_pages,
        "posts": processed_posts,
        "images": image_manifest,
    }
    write_text(OUT_DIR / "content.json", json.dumps(content, ensure_ascii=False, indent=2))
    write_text(OUT_DIR / "menu.json", json.dumps(menu, ensure_ascii=False, indent=2))
    write_text(OUT_DIR / "product-catalog.json", json.dumps(product_catalog, ensure_ascii=False, indent=2))

    with (OUT_DIR / "image-manifest.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["url", "local_path", "status", "wordpress_id", "title", "alt", "caption", "mime_type", "width", "height"],
        )
        writer.writeheader()
        writer.writerows(image_manifest)

    readme = [
        "# Highimage / HITS Legacy Site Crawl",
        "",
        f"- Public URL: {PUBLIC_URL}",
        f"- Actual WordPress URL: {WP_URL}",
        "- Scope: Korean site content from `www.highimage.co.kr`; ENG/CHN links are recorded but not crawled.",
        f"- Crawled at: {content['source']['crawl_date']}",
        f"- Pages: {len(processed_pages)}",
        f"- Posts: {len(processed_posts)}",
        f"- Image files referenced or in media library: {len(image_manifest)}",
        "",
        "## Files",
        "",
        "- `content.json`: full structured migration data for React/static site content.",
        "- `menu.json`: main navigation tree.",
        "- `product-catalog.json`: product groups and product detail pages.",
        "- `image-manifest.csv`: image URL to local asset mapping.",
        "- `pages/*.md`: one Markdown file per WordPress page.",
        "- `posts/*.md`: one Markdown file per WordPress post.",
        "- `assets/`: downloaded image files, preserving WordPress paths where possible.",
        "- `raw/`: raw API JSON and rendered HTML snapshots.",
        "",
        "## Main Menu",
        "",
    ]
    for item in menu:
        readme.append(f"- {item['label']}: {item['url']}")
        for child in item.get("children", []):
            readme.append(f"  - {child['label']}: {child['url']}")
    readme.extend(["", "## Product Catalog", ""])
    for group in product_catalog:
        readme.append(f"- {group['group']}")
        for product in group["items"]:
            readme.append(f"  - {product['title']}: {product['source_url']}")
    readme.extend(["", "## Contact Candidates", ""])
    readme.append(f"- Emails: {', '.join(contact['emails']) or 'none found'}")
    readme.append(f"- Phones: {', '.join(contact['phones']) or 'none found'}")
    write_text(OUT_DIR / "README.md", "\n".join(readme) + "\n")

    print(json.dumps({"pages": len(processed_pages), "posts": len(processed_posts), "images": len(image_manifest)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
