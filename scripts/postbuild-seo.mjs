import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { company, home, pr, products, rnd, site } from "../src/data/content.kr.js";
import { ui } from "../src/data/ui.js";
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

function compact(values) {
  return values.filter((value) => value !== undefined && value !== null && String(value).trim());
}

function lines(values) {
  return compact(values).join(" ");
}

function section(heading, { paragraphs = [], items = [] } = {}) {
  return {
    heading,
    paragraphs: compact(paragraphs),
    items: compact(items),
  };
}

const navLinks = [
  ["/", "HITS 홈"],
  ["/company/ceo", "회사소개"],
  ["/company/business", "사업영역"],
  ["/company/history", "연혁"],
  ["/company/location", "오시는 길"],
  ["/company/partners", "파트너"],
  ["/products", "제품 개요"],
  ["/products/automation", "자동화 시스템"],
  ["/products/vision", "비전 검사 시스템"],
  ["/products/packing", "패킹 출하 시스템"],
  ["/rnd/performance", "연구개발 성과"],
  ["/rnd/key-technology", "핵심 기술"],
  ["/rnd/core-competencies", "핵심 역량"],
  ["/pr", "홍보센터"],
  ["/pr/news", "HITS 뉴스"],
];

function contactSection() {
  return section("공식 연락처", {
    paragraphs: [
      `${site.contact.company} ${site.contact.dept}`,
      site.contact.address,
      `전화 ${site.contact.phone}`,
      `이메일 ${site.contact.email}`,
    ],
  });
}

function categoryBySlug(slug) {
  return products.categories.find((category) => category.slug === slug);
}

function equipmentItems(category) {
  return category.equipment.flatMap((equipment) => [
    equipment.name,
    ...equipment.systems.map((system) => `${system.name}: ${system.points.join(" / ")}`),
  ]);
}

function routeContent(path) {
  if (path === "/") {
    return {
      lead: lines([home.hero.eyebrow, ...home.hero.titleLines, home.hero.desc]),
      sections: [
        section("핵심 기술", {
          paragraphs: [home.techDesc, home.slogan],
          items: home.technology.map((item) => lines([item.tag, ...item.lines, item.quote])),
        }),
        section("주요 지표", {
          items: ui.kr.home.stats.map((stat) => `${stat.value}: ${stat.label}`),
        }),
        section("회사 소식", {
          items: home.newsPreview.map((news) => `${news.year} ${news.month} ${news.day}일: ${news.title}`),
        }),
      ],
    };
  }

  if (path === "/company/ceo") {
    return {
      lead: lines([company.ceo.eyebrow, ...company.ceo.headlineLines]),
      sections: [
        section("CEO Message", { paragraphs: company.ceo.paragraphs }),
        contactSection(),
      ],
    };
  }

  if (path === "/company/business") {
    return {
      lead: lines([company.businessField.eyebrow, ...company.businessField.headlineLines]),
      sections: [
        section("사업 영역", {
          items: company.businessField.cards.map((card) => `${card.title}: ${card.tag}, ${card.sub}`),
        }),
        contactSection(),
      ],
    };
  }

  if (path === "/company/history") {
    return {
      lead: lines([company.history.eyebrow, ...company.history.headlineLines]),
      sections: [
        section("HITS 연혁", {
          items: company.history.timeline.map((year) => `${year.year}: ${year.events.join(", ")}`),
        }),
      ],
    };
  }

  if (path === "/company/location") {
    return {
      lead: lines([company.location.eyebrow, ...company.location.headlineLines]),
      sections: [
        contactSection(),
        section("오시는 방법", { items: site.directions }),
      ],
    };
  }

  if (path === "/company/partners") {
    return {
      lead: lines([company.partners.eyebrow, ...company.partners.headlineLines]),
      sections: [
        section("주요 파트너", {
          items: company.partners.list.map((partner) => partner.name),
        }),
      ],
    };
  }

  if (path === "/products") {
    return {
      lead: lines([products.overview.eyebrow, ...products.overview.headlineLines]),
      sections: [
        section("제품군", {
          items: products.overview.categories.map((category) => `${category.name}: ${category.items.join(", ")}`),
        }),
      ],
    };
  }

  if (path.startsWith("/products/")) {
    const slug = path.split("/").pop();
    const category = categoryBySlug(slug);
    if (category) {
      return {
        lead: lines([category.name, ...category.headlineLines]),
        sections: [
          section(`${category.name} 장비`, {
            items: equipmentItems(category),
          }),
        ],
      };
    }
  }

  if (path === "/rnd/performance") {
    return {
      lead: lines([rnd.performance.eyebrow, ...rnd.performance.headlineLines]),
      sections: [
        section(rnd.performance.award.name, {
          paragraphs: [rnd.performance.award.desc],
        }),
        section("R&D 성과", {
          items: rnd.performance.items.flatMap((item) => [item.title, ...item.points]),
        }),
      ],
    };
  }

  if (path === "/rnd/key-technology") {
    return {
      lead: lines([rnd.keyTech.eyebrow, ...rnd.keyTech.headlineLines]),
      sections: [
        section("핵심 기술", {
          items: rnd.keyTech.points,
        }),
      ],
    };
  }

  if (path === "/rnd/core-competencies") {
    return {
      lead: lines([rnd.coreComp.eyebrow, ...rnd.coreComp.headlineLines]),
      sections: [
        section("핵심 역량", {
          paragraphs: [rnd.coreComp.paragraph],
          items: rnd.coreComp.pillars,
        }),
      ],
    };
  }

  if (path === "/pr") {
    return {
      lead: lines([pr.intro.eyebrow, ...pr.intro.headlineLines]),
      sections: [
        section("PR Center", {
          items: pr.cards.map((card) => `${card.field}: ${card.system}, ${card.slogan}`),
        }),
        contactSection(),
      ],
    };
  }

  if (path === "/pr/news") {
    return {
      lead: lines([pr.newsIndex.hero.eyebrow, pr.newsIndex.hero.desc]),
      sections: [
        section("HITS 뉴스", {
          items: pr.newsIndex.previews.map((news) => `${news.meta}: ${news.title}. ${news.excerpt}`),
        }),
      ],
    };
  }

  return {
    lead: "HITS 에이치아이티에스 히츠 공식 홈페이지",
    sections: [contactSection()],
  };
}

function staticSectionHtml({ heading, paragraphs, items }) {
  const paragraphHtml = paragraphs.map((paragraph) => `          <p>${escapeHtml(paragraph)}</p>`).join("\n");
  const itemHtml = items.length
    ? `\n          <ul>\n${items
        .map((item) => `            <li>${escapeHtml(item)}</li>`)
        .join("\n")}\n          </ul>`
    : "";
  return `        <section>
          <h2>${escapeHtml(heading)}</h2>
${paragraphHtml}${itemHtml}
        </section>`;
}

function seoStaticContent(seo) {
  const content = routeContent(seo.path);
  const nav = navLinks
    .map(([href, label]) => `          <a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
    .join("\n");
  const sections = [...content.sections, contactSection()]
    .filter((item, index, list) => list.findIndex((candidate) => candidate.heading === item.heading) === index)
    .map(staticSectionHtml)
    .join("\n");

  return `<!-- SEO_STATIC:START -->
      <main class="seo-static-content" aria-label="${escapeHtml(seo.title)}">
        <nav aria-label="HITS 주요 페이지">
${nav}
        </nav>
        <article>
          <p>HITS 에이치아이티에스 히츠 공식 홈페이지</p>
          <h1>${escapeHtml(seo.title)}</h1>
          <p>${escapeHtml(seo.description)}</p>
          <p>${escapeHtml(content.lead)}</p>
${sections}
        </article>
      </main>
      <!-- SEO_STATIC:END -->`;
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

function renderHtml(path) {
  const seo = getSeo(path, "kr");
  return template
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, seoHead(seo))
    .replace(/<!-- SEO_STATIC:START -->[\s\S]*?<!-- SEO_STATIC:END -->/, seoStaticContent(seo));
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
