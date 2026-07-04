export const SITE_URL = "https://hits.ive.codes";

const DEFAULT_IMAGE = "/assets/wp-content/uploads/2020/03/715-1024x559.jpg";
const DEFAULT_KEYWORDS = [
  "HITS",
  "에이치아이티에스",
  "히츠",
  "High Image Technology System",
  "반도체 자동화 장비",
  "비전 검사 시스템",
  "자동화 시스템",
  "패킹 자동화",
  "검사 장비",
];

const ROUTE_ALIASES = {
  "/company": "/company/ceo",
  "/rnd": "/rnd/performance",
};

const BREADCRUMB_LABELS = {
  "/": "HITS 홈",
  "/company/ceo": "회사소개",
  "/company/business": "사업영역",
  "/company/history": "연혁",
  "/company/location": "오시는 길",
  "/company/partners": "파트너",
  "/products": "제품",
  "/products/automation": "자동화 시스템",
  "/products/vision": "비전 검사 시스템",
  "/products/packing": "패킹·출하 시스템",
  "/rnd/performance": "R&D 성과",
  "/rnd/key-technology": "핵심 기술",
  "/rnd/core-competencies": "핵심 역량",
  "/pr": "홍보센터",
  "/pr/news": "HITS 뉴스",
};

export const seoRoutes = [
  {
    path: "/",
    title: "HITS 에이치아이티에스 히츠 | 자동화·비전 검사 공식 홈페이지",
    description:
      "HITS(에이치아이티에스, 히츠)는 반도체·디스플레이·이차전지 생산 현장의 자동화 장비, 비전 검사 시스템, 패킹 자동화를 개발하는 기업입니다.",
    priority: "1.0",
    changefreq: "weekly",
  },
  {
    path: "/company/ceo",
    title: "회사소개 | HITS 에이치아이티에스",
    description:
      "㈜에이치아이티에스 CEO 인사말과 회사 비전입니다. HITS는 고객 만족을 위한 자동화 장비와 비전 검사 기술을 개발합니다.",
    priority: "0.8",
  },
  {
    path: "/company/business",
    title: "사업영역 | HITS 에이치아이티에스",
    description:
      "HITS의 사업영역은 반도체·디스플레이 장비, AI 비전 검사, 트레이·릴 패킹 자동화, 스마트팩토리 시스템입니다.",
    priority: "0.85",
  },
  {
    path: "/company/history",
    title: "연혁 | HITS 에이치아이티에스",
    description:
      "1999년 설립 이후 반도체 검사 시스템, LCD 검사 시스템, IR52 장영실상 수상 등 HITS의 기술 개발 연혁입니다.",
    priority: "0.75",
  },
  {
    path: "/company/location",
    title: "오시는 길 | HITS 에이치아이티에스",
    description:
      "㈜에이치아이티에스 본사, 기술연구소, 공장 위치와 연락처입니다. 경기도 부천시 부일로 809번길 81 히트비젼타워 4층.",
    priority: "0.7",
  },
  {
    path: "/company/partners",
    title: "파트너 | HITS 에이치아이티에스",
    description:
      "HITS는 삼성SDI, 삼성, LG Display, SK hynix 등 글로벌 기업과 함께 자동화·비전 검사 기술을 공급합니다.",
    priority: "0.7",
  },
  {
    path: "/products",
    title: "제품 개요 | HITS 자동화·비전 검사 장비",
    description:
      "HITS 제품군은 자동화 시스템, 비전 검사 시스템, 패킹·출하 시스템으로 구성되어 생산성 향상과 품질 개선을 지원합니다.",
    priority: "0.9",
  },
  {
    path: "/products/automation",
    title: "자동화 시스템 | HITS 에이치아이티에스",
    description:
      "HITS 자동화 시스템은 Auto Loader, Unloader, Substrate Split & Merge, Assembly Tester 등 생산라인 자동화 장비를 제공합니다.",
    priority: "0.9",
  },
  {
    path: "/products/vision",
    title: "비전 검사 시스템 | HITS 에이치아이티에스",
    description:
      "HITS 비전 검사 시스템은 Deep Learning과 고속 정밀 검사 기술로 반도체, 디스플레이, 이차전지 품질 검사를 지원합니다.",
    priority: "0.9",
  },
  {
    path: "/products/packing",
    title: "패킹·출하 시스템 | HITS 에이치아이티에스",
    description:
      "HITS 패킹·출하 시스템은 Inline Tray Auto Packing, Inline Reel Auto Packing 등 Human Error Zero 자동화를 제공합니다.",
    priority: "0.85",
  },
  {
    path: "/rnd/performance",
    title: "R&D 성과 | HITS 에이치아이티에스",
    description:
      "HITS R&D 성과는 Wire Bond 자동 검사, 반도체 패키지 2D/3D 고속 검사, Chromatic Confocal 정밀 측정 기술입니다.",
    priority: "0.8",
  },
  {
    path: "/rnd/key-technology",
    title: "핵심 기술 | HITS 에이치아이티에스",
    description:
      "HITS 핵심 기술은 자동화 제어, 고속 비전 검사, Deep Learning 검사, 정밀 측정, 스마트팩토리 통합 기술입니다.",
    priority: "0.75",
  },
  {
    path: "/rnd/core-competencies",
    title: "핵심 역량 | HITS 에이치아이티에스",
    description:
      "HITS 핵심 역량은 20년 이상의 장비 개발 노하우, 고객 맞춤형 개발, 고급 기술 지원, 품질 중심 R&D입니다.",
    priority: "0.75",
  },
  {
    path: "/pr",
    title: "홍보센터 | HITS 에이치아이티에스",
    description:
      "HITS 홍보센터에서는 고객 맞춤 시스템 개발, 자동화 장비, 비전 검사 시스템, 패킹 자동화 관련 회사 정보를 제공합니다.",
    priority: "0.7",
  },
  {
    path: "/pr/news",
    title: "HITS 뉴스 | 에이치아이티에스 소식",
    description:
      "에이치아이티에스 홈페이지 리뉴얼, 창사 기념, 부천 사옥 이전, IR52 장영실상 수상 등 HITS 주요 소식입니다.",
    priority: "0.7",
    changefreq: "monthly",
  },
];

export const routePaths = seoRoutes.map((route) => route.path);

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalPath(path = "/") {
  const [rawPath, hash = ""] = String(path || "/").split("#");
  let clean = rawPath.split("?")[0] || "/";
  if (!clean.startsWith("/")) clean = `/${clean}`;
  clean = clean.replace(/\/{2,}/g, "/");
  if (clean.length > 1) clean = clean.replace(/\/$/, "");
  clean = ROUTE_ALIASES[clean] || clean;
  return hash ? `${clean}#${hash}` : clean;
}

export function toPublicPath(path = "/") {
  const [rawPath, hash = ""] = String(path || "/").split("#");
  const clean = canonicalPath(rawPath);
  return `${clean}${hash ? `#${hash}` : ""}`;
}

export function getSeo(path = "/", lang = "kr") {
  const cleanPath = canonicalPath(path).split("#")[0];
  const route = seoRoutes.find((item) => item.path === cleanPath);
  const base = route || seoRoutes[0];
  const isKnownRoute = Boolean(route);
  const title =
    lang === "kr"
      ? base.title
      : `${base.title} | HITS High Image Technology System`;
  return {
    ...base,
    title,
    path: isKnownRoute ? base.path : cleanPath,
    canonical: absoluteUrl(isKnownRoute ? base.path : cleanPath),
    image: absoluteUrl(base.image || DEFAULT_IMAGE),
    keywords: DEFAULT_KEYWORDS.join(", "),
    robots: isKnownRoute ? "index,follow,max-image-preview:large" : "noindex,follow",
    changefreq: base.changefreq || "monthly",
    lang: lang === "en" ? "en" : lang === "cn" ? "zh-CN" : "ko-KR",
  };
}

function breadcrumbItems(path) {
  const cleanPath = canonicalPath(path).split("#")[0];
  if (cleanPath === "/") {
    return [
      {
        name: BREADCRUMB_LABELS["/"],
        item: absoluteUrl("/"),
      },
    ];
  }

  const parts = cleanPath.split("/").filter(Boolean);
  const items = [
    {
      name: BREADCRUMB_LABELS["/"],
      item: absoluteUrl("/"),
    },
  ];

  let current = "";
  for (const part of parts) {
    current = `${current}/${part}`;
    const canonical = canonicalPath(current);
    items.push({
      name: BREADCRUMB_LABELS[canonical] || part,
      item: absoluteUrl(canonical),
    });
  }

  return items.filter((item, index, list) => list.findIndex((candidate) => candidate.item === item.item) === index);
}

export function buildStructuredData(seo) {
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const breadcrumbId = `${seo.canonical}#breadcrumb`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "HITS",
        legalName: "주식회사 에이치아이티에스",
        alternateName: [
          "에이치아이티에스",
          "히츠",
          "(주)에이치아이티에스",
          "High Image Technology System",
          "HITS Co., Ltd.",
        ],
        url: SITE_URL,
        logo: absoluteUrl("/favicon.svg"),
        description:
          "반도체·디스플레이·이차전지 분야의 자동화 장비와 비전 검사 시스템을 개발하는 기업",
        email: "hitssales@highimage.co.kr",
        telephone: "+82-2-2066-3890",
        foundingDate: "1999",
        sameAs: ["https://highimage.co.kr/"],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: "+82-2-2066-3890",
            email: "hitssales@highimage.co.kr",
            areaServed: "KR",
            availableLanguage: ["ko", "en", "zh"],
          },
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "KR",
          addressRegion: "경기도",
          addressLocality: "부천시",
          streetAddress: "부일로 809번길 81 히트비젼타워 4층",
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: "HITS 에이치아이티에스 공식 홈페이지",
        alternateName: ["HITS", "에이치아이티에스", "히츠"],
        publisher: { "@id": orgId },
        inLanguage: "ko-KR",
      },
      {
        "@type": "WebPage",
        "@id": `${seo.canonical}#webpage`,
        url: seo.canonical,
        name: seo.title,
        description: seo.description,
        isPartOf: { "@id": websiteId },
        about: { "@id": orgId },
        breadcrumb: { "@id": breadcrumbId },
        keywords: seo.keywords,
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: seo.image,
        },
        inLanguage: seo.lang,
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: breadcrumbItems(seo.path).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.item,
        })),
      },
    ],
  };
}
