// UI string dictionary for the 3 site languages: kr (한국어) / en (English) / cn (中文).
// `kr` is the source of truth. `en` and `cn` MUST mirror the exact same key structure
// (same nested keys, same array lengths). Missing keys fall back to `kr` at runtime.
//
// Do NOT translate: numbers in `home.stats[].value`, and the language names in `lang`
// (those stay in their own native script across all locales).

const kr = {
  nav: {
    home: "홈",
    company: "회사소개",
    products: "제품",
    rnd: "연구개발",
    pr: "홍보센터",
    ceo: "CEO 인사말",
    business: "사업영역",
    history: "연혁",
    location: "오시는 길",
    partners: "파트너",
    overview: "제품 개요",
    automation: "자동화 시스템",
    vision: "비전 검사 시스템",
    packing: "패킹 / 출하 시스템",
    performance: "연구개발 성과",
    keytech: "핵심 기술",
    corecomp: "핵심 역량",
    prcenter: "홍보센터",
    news: "HITS 뉴스",
  },
  cta: {
    products: "제품 둘러보기",
    rndPerf: "R&D 성과 보기",
    more: "자세히 보기",
    viewAll: "전체 보기",
    bizMore: "사업 영역 자세히 보기",
    rndMore: "연구개발 성과 보기",
    allNews: "전체 소식 보기",
    allNews2: "HITS 뉴스 전체 보기",
    home: "홈으로 이동",
  },
  search: {
    placeholder: "제품, 기술, 메뉴 검색",
    reco: "추천 검색어",
    empty: "에 대한 검색 결과가 없습니다.",
    menuGroup: "메뉴",
    keywords: ["Vision", "Packing", "Automation", "장영실상", "연혁", "파트너"],
    open: "검색 열기",
    close: "검색 닫기",
    inputAria: "검색어 입력",
  },
  menu: {
    openAll: "전체 메뉴 열기",
    close: "메뉴 닫기",
    aria: "전체 메뉴",
  },
  home: {
    techTitle: "자동화 · 비전 검사 · 패킹, 세 가지 핵심 기술",
    techDesc:
      "생산라인의 Full Automation부터 Deep Learning 비전 검사, 출하 단계 Human Error Zero화까지 하나의 흐름으로 통합합니다.",
    rndTitle: ["IR52 장영실상으로 증명된", "고속 정밀 검사 기술"],
    rndDesc:
      "Wire Bond 자동 검사, 반도체 패키지 2D/3D 고속 검사, Chromatic Confocal 기반 정밀 측정까지 — 지난 20년간 고객과 함께 품질을 책임져 온 HITS의 연구개발 성과입니다.",
    bizTitle: ["세계 반도체/디스플레이", "장비산업을 선도하는 글로벌 기업"],
    bizDesc:
      "Equipment, Vision AI, Packing, Smart Factory — 반도체와 디스플레이, 이차전지 현장을 이해하는 R&D 조직을 바탕으로 자동화 장비와 검사 시스템을 함께 설계합니다.",
    newsTitle: "회사 소식과 주요 성과",
    stats: [
      { value: "1999", label: "반도체·비전 검사 시스템 개발 시작" },
      { value: "3", label: "IR52 장영실상 수상 (2008·2012·2014)" },
      { value: "10", label: "글로벌 파트너사" },
      { value: "26", label: "자동화 · 검사 시스템 라인업" },
    ],
  },
  company: {
    ceoSign: "㈜에이치아이티에스 임직원 일동",
    directions: "오시는 방법",
    mapAlt: "HITS 위치 지도",
  },
  products: {
    overviewTitle: "제품 개요",
    composition: "구성",
  },
  history: {
    hint: "좌우로 스크롤하여 연혁 보기",
    prev: "이전 연도",
    next: "다음 연도",
    aria: "HITS 연혁",
  },
  footer: {
    sitemap: "사이트맵",
    contact: "연락처",
    rights: "All rights reserved.",
  },
  notFound: {
    title: "페이지를 찾을 수 없습니다",
    desc: "요청하신 페이지가 존재하지 않습니다.",
  },
  a11y: {
    langSelect: "언어 선택",
    slide: "슬라이드",
    subnav: "하위 메뉴",
    mainnav: "주요 메뉴",
    home: "HITS 홈",
  },
};

// English and Chinese are filled in below (mirror the `kr` structure exactly).
const en = {
  nav: {
    home: "Home",
    company: "Company",
    products: "Products",
    rnd: "R&D",
    pr: "PR Center",
    ceo: "CEO Message",
    business: "Business Areas",
    history: "History",
    location: "Location",
    partners: "Partners",
    overview: "Product Overview",
    automation: "Automation Systems",
    vision: "Vision Inspection Systems",
    packing: "Packing / Shipping Systems",
    performance: "R&D Achievements",
    keytech: "Core Technologies",
    corecomp: "Core Competencies",
    prcenter: "PR Center",
    news: "HITS News",
  },
  cta: {
    products: "Explore Products",
    rndPerf: "View R&D Achievements",
    more: "Learn More",
    viewAll: "View All",
    bizMore: "Learn More About Our Business Areas",
    rndMore: "View R&D Achievements",
    allNews: "View All News",
    allNews2: "View All HITS News",
    home: "Go to Home",
  },
  search: {
    placeholder: "Search products, technologies, and menus",
    reco: "Recommended Searches",
    empty: " returned no search results.",
    menuGroup: "Menu",
    keywords: ["Vision", "Packing", "Automation", "Award", "History", "Partners"],
    open: "Open Search",
    close: "Close Search",
    inputAria: "Enter search term",
  },
  menu: {
    openAll: "Open Full Menu",
    close: "Close Menu",
    aria: "Full Menu",
  },
  home: {
    techTitle: "Three Core Technologies: Automation, Vision Inspection, and Packing",
    techDesc:
      "We integrate the entire flow, from full automation of production lines to deep learning vision inspection and zero human error in shipping.",
    rndTitle: ["Proven by the IR52 Jang Young Sil Award", "High-Speed Precision Inspection Technology"],
    rndDesc:
      "From automated wire bond inspection and high-speed 2D/3D semiconductor package inspection to precision measurement based on chromatic confocal technology, these are HITS' R&D achievements built with customers over the past 20 years to ensure quality.",
    bizTitle: ["A Global Leader in the Semiconductor and Display", "Equipment Industry"],
    bizDesc:
      "Equipment, Vision AI, Packing, Smart Factory. Backed by an R&D organization that understands semiconductor, display, and secondary battery sites, we design automation equipment and inspection systems together.",
    newsTitle: "Company News and Key Achievements",
    stats: [
      { value: "1999", label: "Began developing semiconductor and vision inspection systems" },
      { value: "3", label: "IR52 Jang Young-sil Awards (2008, 2012, 2014)" },
      { value: "10", label: "Global partners" },
      { value: "26", label: "Automation and inspection system lineup" },
    ],
  },
  company: {
    ceoSign: "All employees of HITS Co., Ltd.",
    directions: "Directions",
    mapAlt: "Map showing the location of HITS",
  },
  products: {
    overviewTitle: "Product Overview",
    composition: "Composition",
  },
  history: {
    hint: "Scroll horizontally to view the history",
    prev: "Previous Year",
    next: "Next Year",
    aria: "HITS History",
  },
  footer: {
    sitemap: "Sitemap",
    contact: "Contact",
    rights: "All rights reserved.",
  },
  notFound: {
    title: "Page Not Found",
    desc: "The page you requested does not exist.",
  },
  a11y: {
    langSelect: "Select Language",
    slide: "Slide",
    subnav: "Submenu",
    mainnav: "Main Navigation",
    home: "HITS Home",
  },
};
const cn = {
  nav: {
    home: "首页",
    company: "公司介绍",
    products: "产品",
    rnd: "研发",
    pr: "宣传中心",
    ceo: "CEO 致辞",
    business: "业务领域",
    history: "发展历程",
    location: "交通路线",
    partners: "合作伙伴",
    overview: "产品概览",
    automation: "自动化系统",
    vision: "视觉检测系统",
    packing: "包装 / 出货系统",
    performance: "研发成果",
    keytech: "核心技术",
    corecomp: "核心能力",
    prcenter: "宣传中心",
    news: "HITS 新闻",
  },
  cta: {
    products: "浏览产品",
    rndPerf: "查看研发成果",
    more: "了解更多",
    viewAll: "查看全部",
    bizMore: "详细了解业务领域",
    rndMore: "查看研发成果",
    allNews: "查看全部消息",
    allNews2: "查看全部 HITS 新闻",
    home: "前往首页",
  },
  search: {
    placeholder: "搜索产品、技术、菜单",
    reco: "推荐搜索词",
    empty: "没有相关搜索结果。",
    menuGroup: "菜单",
    keywords: ["Vision", "Packing", "Automation", "张英实奖", "发展历程", "合作伙伴"],
    open: "打开搜索",
    close: "关闭搜索",
    inputAria: "输入搜索词",
  },
  menu: {
    openAll: "打开全部菜单",
    close: "关闭菜单",
    aria: "全部菜单",
  },
  home: {
    techTitle: "自动化、视觉检测、包装三大核心技术",
    techDesc:
      "从生产线全自动化到深度学习视觉检测，再到出货阶段实现人为错误归零，我们将整个流程整合为一体。",
    rndTitle: ["荣获 IR52 张英实奖认证的", "高速精密检测技术"],
    rndDesc:
      "从 Wire Bond 自动检测、半导体封装 2D/3D 高速检测，到基于 Chromatic Confocal 的精密测量，这是 HITS 过去 20 年与客户共同守护品质所积累的研发成果。",
    bizTitle: ["引领全球半导体 / 显示", "设备产业的企业"],
    bizDesc:
      "Equipment、Vision AI、Packing、Smart Factory。基于深刻理解半导体、显示和二次电池现场的研发组织，我们同时设计自动化设备与检测系统。",
    newsTitle: "公司新闻与主要成果",
    stats: [
      { value: "1999", label: "开始开发半导体与视觉检测系统" },
      { value: "3", label: "荣获 IR52 张英实奖（2008、2012、2014）" },
      { value: "10", label: "全球合作伙伴" },
      { value: "26", label: "自动化与检测系统产品阵容" },
    ],
  },
  company: {
    ceoSign: "HITS有限公司 全体员工",
    directions: "交通方式",
    mapAlt: "HITS 位置地图",
  },
  products: {
    overviewTitle: "产品概览",
    composition: "构成",
  },
  history: {
    hint: "左右滚动查看发展历程",
    prev: "上一年度",
    next: "下一年度",
    aria: "HITS 发展历程",
  },
  footer: {
    sitemap: "网站地图",
    contact: "联系方式",
    rights: "All rights reserved.",
  },
  notFound: {
    title: "无法找到页面",
    desc: "您请求的页面不存在。",
  },
  a11y: {
    langSelect: "选择语言",
    slide: "幻灯片",
    subnav: "子菜单",
    mainnav: "主菜单",
    home: "HITS 首页",
  },
};

export const ui = { kr, en, cn };
