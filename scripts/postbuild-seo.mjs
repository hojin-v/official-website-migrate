import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildStructuredData, getSeo, routePaths, SITE_URL } from "../src/seo.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const indexPath = join(dist, "index.html");
const template = await readFile(indexPath, "utf8");
const today = new Date().toISOString().slice(0, 10);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function seoHead(seo) {
  const json = JSON.stringify(buildStructuredData(seo));
  return `<!-- SEO:START -->
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <meta name="keywords" content="${escapeHtml(seo.keywords)}" />
    <meta name="robots" content="${escapeHtml(seo.robots)}" />
    <link rel="canonical" href="${escapeHtml(seo.canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="HITS 에이치아이티에스" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${escapeHtml(seo.canonical)}" />
    <meta property="og:image" content="${escapeHtml(seo.image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <script type="application/ld+json" id="seo-structured-data">${json}</script>
    <!-- SEO:END -->`;
}

function seoNoScript(seo) {
  return `<!-- SEO_NOSCRIPT:START -->
      <noscript>
        <main>
          <h1>${escapeHtml(seo.title)}</h1>
          <p>${escapeHtml(seo.description)}</p>
          <p>HITS 에이치아이티에스 히츠 공식 홈페이지: ${escapeHtml(seo.canonical)}</p>
        </main>
      </noscript>
      <!-- SEO_NOSCRIPT:END -->`;
}

function renderHtml(path) {
  const seo = getSeo(path, "kr");
  return template
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, seoHead(seo))
    .replace(/<!-- SEO_NOSCRIPT:START -->[\s\S]*?<!-- SEO_NOSCRIPT:END -->/, seoNoScript(seo));
}

async function writeRoute(path) {
  const outPath = path === "/" ? indexPath : join(dist, path.replace(/^\//, ""), "index.html");
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, renderHtml(path));
  if (path !== "/") {
    const flatPath = join(dist, `${path.replace(/^\//, "")}.html`);
    await mkdir(dirname(flatPath), { recursive: true });
    await writeFile(flatPath, renderHtml(path));
  }
}

for (const path of routePaths) {
  await writeRoute(path);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routePaths
  .map((path) => {
    const seo = getSeo(path, "kr");
    return `  <url>
    <loc>${seo.canonical}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${seo.changefreq}</changefreq>
    <priority>${seo.priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

User-agent: Yeti
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

await writeFile(join(dist, "sitemap.xml"), sitemap);
await writeFile(join(dist, "robots.txt"), robots);
