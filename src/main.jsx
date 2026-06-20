import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Mail,
  MapPin,
  Menu as MenuIcon,
  Phone,
  Search,
  X,
} from "lucide-react";
import { useReveal } from "./hooks/useReveal";
import { LangProvider, useI18n, LANGS, LANG_LABELS } from "./i18n";
import "./styles.css";

/* ------------------------------------------------------------------ */
/* Navigation model (labels are localized via t)                       */
/* ------------------------------------------------------------------ */
function buildMenu(t) {
  return [
    { label: t("nav.home"), path: "/", children: [] },
    {
      label: t("nav.company"),
      path: "/company",
      children: [
        { label: t("nav.ceo"), path: "/company/ceo" },
        { label: t("nav.business"), path: "/company/business" },
        { label: t("nav.history"), path: "/company/history" },
        { label: t("nav.location"), path: "/company/location" },
        { label: t("nav.partners"), path: "/company/partners" },
      ],
    },
    {
      label: t("nav.products"),
      path: "/products",
      children: [
        { label: t("nav.overview"), path: "/products" },
        { label: t("nav.automation"), path: "/products/automation" },
        { label: t("nav.vision"), path: "/products/vision" },
        { label: t("nav.packing"), path: "/products/packing" },
      ],
    },
    {
      label: t("nav.rnd"),
      path: "/rnd",
      children: [
        { label: t("nav.performance"), path: "/rnd/performance" },
        { label: t("nav.keytech"), path: "/rnd/key-technology" },
        { label: t("nav.corecomp"), path: "/rnd/core-competencies" },
      ],
    },
    {
      label: t("nav.pr"),
      path: "/pr",
      children: [
        { label: t("nav.prcenter"), path: "/pr" },
        { label: t("nav.news"), path: "/pr/news" },
      ],
    },
  ];
}

const childrenOf = (menu, path) => menu.find((m) => m.path === path)?.children || [];

/* ------------------------------------------------------------------ */
/* Brand logo (SVG recreation of the legacy highimage.co.kr logo:      */
/* four maroon squares + deep-blue "HITS" wordmark + gray subtitle)    */
/* ------------------------------------------------------------------ */
function Logo({ variant = "light", className = "" }) {
  const blue = variant === "dark" ? "#ffffff" : "#0b2a8c";
  const red = variant === "dark" ? "#e2574d" : "#8a1a1a";
  const gray = variant === "dark" ? "rgba(255,255,255,0.62)" : "#4d4d4d";
  return (
    <svg
      className={`logo ${className}`}
      viewBox="0 0 210 62"
      role="img"
      aria-label="HITS — High Image Technology System"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={red}>
        <rect x="2" y="0" width="12" height="12" />
        <rect x="19" y="0" width="12" height="12" />
        <rect x="36" y="0" width="12" height="12" />
      </g>
      <text
        x="0"
        y="47"
        fontFamily="Pretendard, Arial, sans-serif"
        fontWeight="800"
        fontSize="44"
        letterSpacing="-1"
        fill={blue}
      >
        HITS
      </text>
      <text
        x="2"
        y="60"
        fontFamily="Pretendard, Arial, sans-serif"
        fontWeight="600"
        fontSize="8.6"
        letterSpacing="0.8"
        fill={gray}
      >
        HIGH IMAGE TECHNOLOGY SYSTEM
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Routing helpers                                                     */
/* ------------------------------------------------------------------ */
function routeFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash || hash === "/") return "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
}

function useHashRoute() {
  const [route, setRoute] = React.useState(routeFromHash);
  React.useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

const to = (path) => `#${path}`;

function topSection(route) {
  if (route.startsWith("/company")) return "/company";
  if (route.startsWith("/products")) return "/products";
  if (route.startsWith("/rnd")) return "/rnd";
  if (route.startsWith("/pr")) return "/pr";
  return route;
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */
function Reveal({ children, className = "", delay = 0, as: Tag = "div", style, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`${className} reveal ${visible ? "is-visible" : ""}`}
      style={{ "--delay": `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Lines({ items }) {
  return (
    <>
      {items.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < items.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

function SectionHead({ title, desc, lines }) {
  return (
    <Reveal className="section-head">
      {title && <h2>{title}</h2>}
      {lines && (
        <h2>
          <Lines items={lines} />
        </h2>
      )}
      {desc && <p>{desc}</p>}
    </Reveal>
  );
}

function PageHero({ title, desc, image }) {
  return (
    <section className="page-hero">
      <img src={image} alt="" />
      <div className="page-hero-inner">
        <Reveal>
          <h1>{title}</h1>
          {desc && <p>{desc}</p>}
        </Reveal>
      </div>
    </section>
  );
}

function SubNav({ items, active }) {
  const { t } = useI18n();
  return (
    <nav className="subnav" aria-label={t("a11y.subnav")}>
      <div className="subnav-inner">
        {items.map((item) => (
          <a
            key={item.path}
            href={to(item.path)}
            className={item.path === active ? "is-active" : ""}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Header + overlays                                                   */
/* ------------------------------------------------------------------ */
function buildSearchIndex(c, t) {
  const menu = buildMenu(t);
  const idx = [];
  menu.forEach((item) => {
    if (item.path !== "/") idx.push({ title: item.label, group: t("search.menuGroup"), path: item.path });
    item.children.forEach((ch) => idx.push({ title: ch.label, group: item.label, path: ch.path }));
  });
  c.products.categories.forEach((cat) => {
    cat.equipment.forEach((eq) => {
      idx.push({ title: eq.name, group: cat.name, path: `/products/${cat.slug}#${eq.slug}` });
      eq.systems.forEach((s) =>
        idx.push({ title: s.name, group: eq.name, path: `/products/${cat.slug}#${eq.slug}` })
      );
    });
  });
  c.rnd.performance.items.forEach((it) =>
    idx.push({ title: it.title, group: t("nav.performance"), path: "/rnd/performance" })
  );
  idx.push({
    title: c.rnd.performance.award.name,
    group: t("nav.performance"),
    path: "/rnd/performance",
  });
  c.rnd.coreComp.pillars.forEach((p) =>
    idx.push({ title: p, group: t("nav.corecomp"), path: "/rnd/core-competencies" })
  );
  c.company.partners.list.forEach((p) =>
    idx.push({ title: p.name, group: t("nav.partners"), path: "/company/partners" })
  );
  c.pr.posts.forEach((p) => idx.push({ title: p.title, group: t("nav.news"), path: "/pr/news" }));

  const seen = new Set();
  return idx.filter((it) => {
    const k = `${it.title}|${it.path}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function SearchOverlay({ onClose }) {
  const { c, t } = useI18n();
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef(null);
  const index = React.useMemo(() => buildSearchIndex(c, t), [c, t]);

  React.useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const query = q.trim().toLowerCase();
  const results = query
    ? index
        .filter(
          (it) =>
            it.title.toLowerCase().includes(query) || it.group.toLowerCase().includes(query)
        )
        .slice(0, 16)
    : [];
  const keywords = t("search.keywords");

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={t("search.open")} onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-bar">
          <Search size={22} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.inputAria")}
          />
          <button className="util-btn" type="button" onClick={onClose} aria-label={t("search.close")}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {!query && (
          <div className="search-reco">
            <p>{t("search.reco")}</p>
            <div>
              {keywords.map((k) => (
                <button key={k} type="button" onClick={() => setQ(k)}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {query && (
          <div className="search-results">
            {results.length === 0 ? (
              <p className="search-empty">‘{q}’{t("search.empty")}</p>
            ) : (
              results.map((it) => (
                <a key={`${it.path}-${it.title}`} href={to(it.path)} onClick={onClose}>
                  <span className="sr-title">{it.title}</span>
                  <span className="sr-group">{it.group}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuOverlay({ onClose }) {
  const { c, t } = useI18n();
  const menu = buildMenu(t);

  React.useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="menu-overlay" role="dialog" aria-modal="true" aria-label={t("menu.aria")}>
      <div className="menu-overlay-top">
        <div className="container menu-overlay-top-inner">
          <a className="brand" href={to("/")} onClick={onClose} aria-label={t("a11y.home")}>
            <Logo />
          </a>
          <button className="util-btn" type="button" onClick={onClose} aria-label={t("menu.close")}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="container menu-overlay-grid">
        {menu.map((item) => (
          <div className="menu-col" key={item.path}>
            <a className="menu-col-title" href={to(item.path)} onClick={onClose}>
              {item.label}
            </a>
            <div className="menu-col-links">
              {item.children.map((ch) => (
                <a key={ch.path} href={to(ch.path)} onClick={onClose}>
                  {ch.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="container menu-overlay-foot">
        <a href={`tel:${c.site.contact.phone.replace(/[^0-9+]/g, "")}`}>
          <Phone size={16} aria-hidden="true" /> {c.site.contact.phone}
        </a>
        <a href={`mailto:${c.site.contact.email}`}>
          <Mail size={16} aria-hidden="true" /> {c.site.contact.email}
        </a>
      </div>
    </div>
  );
}

function Header({ route }) {
  const { c, t, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const section = topSection(route);
  const menu = buildMenu(t);

  React.useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [route]);

  React.useEffect(() => {
    const open = menuOpen || searchOpen;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={to("/")} aria-label={t("a11y.home")}>
            <Logo />
          </a>

          <nav className="desktop-nav" aria-label={t("a11y.mainnav")}>
            {menu.map((item) => (
              <div
                key={item.path}
                className={`nav-group ${section === item.path ? "is-active" : ""}`}
              >
                <a href={to(item.path)} onClick={(e) => e.currentTarget.blur()}>
                  {item.label}
                </a>
                {item.children.length > 0 && (
                  <div className="dropdown">
                    {item.children.map((child) => (
                      <a
                        key={child.path}
                        href={to(child.path)}
                        onClick={(e) => e.currentTarget.blur()}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="header-actions">
            <div className="lang-select">
              <button
                className="util-btn"
                type="button"
                aria-haspopup="true"
                aria-label={t("a11y.langSelect")}
              >
                <Globe size={21} aria-hidden="true" />
              </button>
              <div className="lang-menu" role="menu">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="menuitemradio"
                    aria-checked={lang === l}
                    className={`lang-opt ${lang === l ? "is-active" : ""}`}
                    onClick={() => setLang(l)}
                  >
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="util-btn"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("search.open")}
            >
              <Search size={21} aria-hidden="true" />
            </button>

            <button
              className="util-btn"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("menu.openAll")}
            >
              <MenuIcon size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */
function HomeHero() {
  const { c, t } = useI18n();
  const images = c.home.hero.images;
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => setIdx((v) => (v + 1) % images.length), 5200);
    return () => window.clearInterval(id);
  }, [images.length]);

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        {images.map((src, i) => (
          <img src={src} alt="" key={src} className={i === idx ? "is-active" : ""} />
        ))}
      </div>
      <div className="hero-inner">
        <Reveal>
          <p className="hero-eyebrow">{c.home.hero.eyebrow}</p>
          <h1>
            <Lines items={c.home.hero.titleLines} />
          </h1>
          <p className="hero-desc">{c.home.hero.desc}</p>
          <div className="hero-actions">
            <a className="btn btn--primary" href={to("/products")}>
              {t("cta.products")}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="btn btn--ghost" href={to("/rnd/performance")}>
              {t("cta.rndPerf")}
            </a>
          </div>
        </Reveal>
      </div>
      <div className="hero-dots" aria-hidden="true">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            className={i === idx ? "is-active" : ""}
            onClick={() => setIdx(i)}
            aria-label={`${t("a11y.slide")} ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function HomeTechnology() {
  const { c, t } = useI18n();
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={t("home.techTitle")} desc={t("home.techDesc")} />
        <div className="tech-grid">
          {c.home.technology.map((item, i) => (
            <Reveal className="tech-card" delay={i * 90} key={item.tag} as="article">
              <a href={to(item.href)} style={{ display: "contents" }}>
                <img src={item.image} alt={item.tag} loading="lazy" />
                <span className="tech-tag">{item.tag}</span>
                <h3>
                  <Lines items={item.lines} />
                </h3>
                <p className="tech-quote">{item.quote}</p>
                <span className="text-link">
                  {t("cta.more")}
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal className="tech-foot">
          <p>{c.home.techDesc}</p>
          <span>{c.home.slogan}</span>
        </Reveal>
      </div>
    </section>
  );
}

function HomeRnd() {
  const { c, t } = useI18n();
  return (
    <section className="section section--ink">
      <div className="container">
        <div className="split">
          <Reveal className="split-copy">
            <h2 style={{ color: "#fff" }}>
              <Lines items={t("home.rndTitle")} />
            </h2>
            <p style={{ color: "rgba(255,255,255,0.74)" }}>{t("home.rndDesc")}</p>
            <a className="btn btn--ghost" href={to("/rnd/performance")}>
              {t("cta.rndMore")}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </Reveal>
          <Reveal className="split-media" delay={120}>
            <img src={c.rnd.performance.items[0].images[1]} alt="HITS R&D" loading="lazy" />
          </Reveal>
        </div>

        <Reveal className="stat-band" delay={120} style={{ marginTop: "clamp(48px, 7vw, 90px)" }}>
          {t("home.stats").map((stat) => (
            <div className="stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function HomeBusiness() {
  const { c, t } = useI18n();
  return (
    <section className="section section--alt">
      <div className="container">
        <div className="split split--reverse">
          <Reveal className="split-media">
            <img src={c.company.businessField.image} alt="HITS Business Field" loading="lazy" />
          </Reveal>
          <Reveal className="split-copy" delay={100}>
            <h2>
              <Lines items={t("home.bizTitle")} />
            </h2>
            <p>{t("home.bizDesc")}</p>
            <a className="text-link" href={to("/company/business")}>
              {t("cta.bizMore")}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function formatPreviewDate(item) {
  const mm = String(item.month).replace(/[^0-9]/g, "").padStart(2, "0");
  const dd = String(item.day).replace(/[^0-9]/g, "").padStart(2, "0");
  return `${item.year}.${mm}.${dd}`;
}

function HomeNews() {
  const { c, t } = useI18n();
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={t("home.newsTitle")} />
        <div className="news-grid">
          {c.home.newsPreview.map((item, i) => (
            <Reveal className="news-card" delay={i * 70} key={item.title} as="article">
              <a href={to("/pr/news")} style={{ display: "contents" }}>
                <div className="news-thumb">
                  <img src={item.image} alt="" loading="lazy" />
                </div>
                <div className="news-body">
                  <time>{formatPreviewDate(item)}</time>
                  <h3>{item.title}</h3>
                  <p>HITS</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 36 }}>
          <a className="btn btn--outline" href={to("/pr/news")}>
            {t("cta.allNews")}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeTechnology />
      <HomeRnd />
      <HomeBusiness />
      <HomeNews />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Company                                                             */
/* ------------------------------------------------------------------ */
function CompanyCeo() {
  const { c, t } = useI18n();
  const ceo = c.company.ceo;
  return (
    <section className="section">
      <div className="container">
        <div className="ceo-layout">
          <Reveal className="ceo-media">
            <img src={ceo.image} alt="HITS" loading="lazy" />
          </Reveal>
          <Reveal className="ceo-copy" delay={100}>
            <h2>
              <Lines items={ceo.headlineLines} />
            </h2>
            <div className="ceo-paras">
              {ceo.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <p className="ceo-sign">{t("company.ceoSign")}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CompanyBusiness() {
  const { c } = useI18n();
  const b = c.company.businessField;
  return (
    <section className="section">
      <div className="container">
        <SectionHead lines={b.headlineLines} />
        <div className="biz-grid">
          {b.cards.map((card, i) => (
            <Reveal className="biz-card" delay={i * 80} key={card.title}>
              <span className="biz-tag">{card.tag}</span>
              <h3>{card.title}</h3>
              <p>{card.sub}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="biz-media" delay={120}>
          <img src={b.image} alt="HITS Business Field" loading="lazy" />
        </Reveal>
      </div>
    </section>
  );
}

function CompanyHistory() {
  const { c, t } = useI18n();
  const h = c.company.history;
  const railRef = React.useRef(null);

  // Native, non-passive wheel listener with rAF easing so vertical wheel becomes
  // smooth horizontal motion, releasing to the page at the track edges.
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    let target = rail.scrollLeft;
    let animating = false;
    let raf = 0;
    const maxScroll = () => rail.scrollWidth - rail.clientWidth;

    const tick = () => {
      const cur = rail.scrollLeft;
      const diff = target - cur;
      if (Math.abs(diff) < 0.5) {
        rail.scrollLeft = target;
        animating = false;
        return;
      }
      rail.scrollLeft = cur + diff * 0.2;
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = maxScroll();
      const atStart = rail.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = rail.scrollLeft >= max - 1 && event.deltaY > 0;
      if (atStart || atEnd) {
        animating = false;
        return;
      }
      event.preventDefault();
      if (!animating) target = rail.scrollLeft;
      target = Math.max(0, Math.min(max, target + event.deltaY));
      if (!animating) {
        animating = true;
        raf = requestAnimationFrame(tick);
      }
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      rail.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, []);

  const nudge = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.8, 600), behavior: "smooth" });
  };

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <SectionHead lines={h.headlineLines} />
          <div className="htimeline-controls">
            <span className="htimeline-hint">{t("history.hint")}</span>
            <button type="button" onClick={() => nudge(-1)} aria-label={t("history.prev")}>
              <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => nudge(1)} aria-label={t("history.next")}>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="htimeline" ref={railRef} tabIndex={0} aria-label={t("history.aria")}>
        <div className="htimeline-track">
          {h.timeline.map((row) => (
            <div className="htl-item" key={row.year}>
              <span className="htl-dot" aria-hidden="true" />
              <time className="htl-year">{row.year}</time>
              <div className="htl-events">
                {row.events.map((event, i) => (
                  <p key={i}>{event}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanyLocation() {
  const { c, t } = useI18n();
  const site = c.site;
  return (
    <section className="section">
      <div className="container">
        <SectionHead lines={c.company.location.headlineLines} />
        <div className="location-layout">
          <Reveal className="location-card">
            <p className="lc-company">{site.contact.company}</p>
            <p className="lc-dept">{site.contact.dept}</p>
            <p className="lc-address">{site.contact.address}</p>
            <div className="location-contacts">
              <a href={`tel:${site.contact.phone.replace(/[^0-9+]/g, "")}`}>
                <Phone size={18} aria-hidden="true" />
                {site.contact.phone}
              </a>
              <a href={`mailto:${site.contact.email}`}>
                <Mail size={18} aria-hidden="true" />
                {site.contact.email}
              </a>
            </div>
          </Reveal>
          <Reveal className="location-directions" delay={100}>
            <h3>{t("company.directions")}</h3>
            <ul>
              {site.directions.map((line, i) => (
                <li key={i}>
                  <span>{i + 1}</span>
                  {line}
                </li>
              ))}
            </ul>
            {site.mapImages[0] && (
              <div className="location-map">
                <img src={site.mapImages[0]} alt={t("company.mapAlt")} loading="lazy" />
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CompanyPartners() {
  const { c } = useI18n();
  const p = c.company.partners;
  return (
    <section className="section">
      <div className="container">
        <SectionHead lines={p.headlineLines} />
        <div className="partner-grid">
          {p.list.map((partner, i) => (
            <Reveal className="partner-card" delay={i * 50} key={partner.name}>
              <img src={partner.logo} alt={partner.name} loading="lazy" />
              <span>{partner.name}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const COMPANY_RENDER = {
  ceo: CompanyCeo,
  business: CompanyBusiness,
  history: CompanyHistory,
  location: CompanyLocation,
  partners: CompanyPartners,
};

function CompanyPage({ sub }) {
  const { c, t } = useI18n();
  const tabs = childrenOf(buildMenu(t), "/company");
  const heroes = {
    ceo: { title: t("nav.ceo"), hero: c.company.sharedHeroes.default },
    business: { title: t("nav.business"), hero: c.company.sharedHeroes.default },
    history: { title: t("nav.history"), hero: c.company.sharedHeroes.history },
    location: { title: t("nav.location"), hero: c.company.sharedHeroes.default },
    partners: { title: t("nav.partners"), hero: c.company.sharedHeroes.default },
  };
  const key = COMPANY_RENDER[sub] ? sub : "ceo";
  const view = heroes[key];
  const Body = COMPANY_RENDER[key];
  const activePath = key === "ceo" ? "/company/ceo" : `/company/${key}`;
  return (
    <>
      <PageHero title={view.title} desc={view.hero.desc} image={view.hero.image} />
      <SubNav items={tabs} active={activePath} />
      <Body />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */
const CATEGORY_SLUGS = { automation: 0, vision: 1, packing: 2 };

function splitPoints(points) {
  const idx = points.findIndex((p) => /^Composition\s*:/i.test(p));
  if (idx === -1) return { bullets: points, composition: null };
  const bullets = points.slice(0, idx);
  const composition = points
    .slice(idx)
    .join(" ")
    .replace(/^Composition\s*:\s*/i, "");
  return { bullets, composition };
}

function ProductsOverview() {
  const { c, t } = useI18n();
  const o = c.products.overview;
  const tabs = childrenOf(buildMenu(t), "/products");
  return (
    <>
      <PageHero
        title={t("products.overviewTitle")}
        desc={c.products.sharedHeroes.overview.desc}
        image={c.products.sharedHeroes.overview.image}
      />
      <SubNav items={tabs} active="/products" />
      <section className="section">
        <div className="container">
          <SectionHead lines={o.headlineLines} />
          <div className="overview-grid">
            {o.categories.map((cat, ci) => {
              const slug = ["automation", "vision", "packing"][ci];
              const detail = c.products.categories[ci];
              const catLabel = t(`nav.${slug}`);
              return (
                <Reveal className="overview-card" delay={ci * 90} key={cat.name}>
                  <h3>{catLabel}</h3>
                  <ul>
                    {cat.items.map((item) => {
                      const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
                      const ni = norm(item);
                      const eq = detail.equipment.find((e) => {
                        const ne = norm(e.name);
                        return ne === ni || ne.includes(ni) || ni.includes(ne);
                      });
                      return (
                        <li key={item} className={eq ? "" : "is-static"}>
                          {eq ? (
                            <a href={to(`/products/${slug}#${eq.slug}`)}>
                              {item}
                              <ArrowRight size={15} aria-hidden="true" />
                            </a>
                          ) : (
                            <span>{item}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <a className="text-link" style={{ marginTop: 22 }} href={to(`/products/${slug}`)}>
                    {catLabel} {t("cta.viewAll")}
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function SideRail({ items }) {
  const [active, setActive] = React.useState(items[0]?.id);

  React.useEffect(() => {
    const onScroll = () => {
      const line = 180; // just below sticky header + subnav
      let current = items[items.length - 1]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().bottom > line) {
          current = it.id;
          break;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav className="railnav" aria-label="HITS Equipment">
      <div className="railnav-list">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={active === it.id ? "is-active" : ""}
            aria-current={active === it.id ? "true" : undefined}
            onClick={() => go(it.id)}
          >
            <span className="rn-dot" aria-hidden="true" />
            <span className="rn-label">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function CategoryPage({ slug }) {
  const { c, t } = useI18n();
  const cat = c.products.categories[CATEGORY_SLUGS[slug]];
  if (!cat) return <NotFound />;
  const tabs = childrenOf(buildMenu(t), "/products");
  const railItems = cat.equipment.map((eq) => ({ id: eq.slug, label: eq.name }));
  return (
    <>
      <PageHero
        title={t(`nav.${slug}`)}
        desc={cat.headlineLines.join(" ")}
        image={cat.image}
      />
      <SubNav items={tabs} active={`/products/${slug}`} />

      <section className="section">
        <div className="container">
          <div className="detail-layout">
            <aside className="detail-rail">
              <SideRail items={railItems} />
            </aside>

            <div className="detail-main">
              <div className="eq-chips">
                {cat.equipment.map((eq) => (
                  <a key={eq.slug} href={to(`/products/${slug}#${eq.slug}`)}>
                    {eq.name}
                  </a>
                ))}
              </div>

              <div className="equipment">
                {cat.equipment.map((eq, ei) => (
                  <div className="equipment-block" id={eq.slug} key={eq.slug}>
                    <Reveal className="eq-head">
                      <span className="eq-no">{String(ei + 1).padStart(2, "0")}</span>
                      <h2>{eq.name}</h2>
                    </Reveal>
                    <div className="system-list">
                      {eq.systems.map((system) => {
                        const { bullets, composition } = splitPoints(system.points);
                        return (
                          <Reveal className="system-row" key={system.name} as="article">
                            <div className="system-media">
                              <img src={system.image} alt={system.name} loading="lazy" />
                            </div>
                            <div className="system-copy">
                              <h3>{system.name}</h3>
                              <ul className="system-points">
                                {bullets.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                                {composition && (
                                  <li className="is-composition">
                                    <strong>{t("products.composition")}</strong>
                                    {composition}
                                  </li>
                                )}
                              </ul>
                            </div>
                          </Reveal>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* R&D                                                                 */
/* ------------------------------------------------------------------ */
function RndPerformance() {
  const { c } = useI18n();
  const p = c.rnd.performance;
  return (
    <section className="section">
      <div className="container">
        <SectionHead lines={p.headlineLines} />
        <Reveal className="award-band">
          <img src={p.award.image} alt={p.award.name} loading="lazy" />
          <div>
            <h3>{p.award.name}</h3>
            <p>{p.award.desc}</p>
          </div>
        </Reveal>
        {p.items.map((item) => (
          <Reveal className="perf-item" key={item.title} as="article">
            <div>
              <h3>{item.title}</h3>
              <ul>
                {item.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="perf-media">
              {item.images.map((src) => (
                <img src={src} alt={item.title} loading="lazy" key={src} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function RndKeyTech() {
  const { c } = useI18n();
  const k = c.rnd.keyTech;
  return (
    <section className="section">
      <div className="container">
        <div className="keytech-grid">
          <Reveal>
            <h2 style={{ fontSize: "clamp(26px,3.2vw,40px)" }}>
              <Lines items={k.headlineLines} />
            </h2>
            <ul className="keytech-list">
              {k.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100}>
            <img src={k.image} alt="HITS" loading="lazy" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function RndCoreComp() {
  const { c } = useI18n();
  const cc = c.rnd.coreComp;
  return (
    <section className="section">
      <div className="container">
        <SectionHead lines={cc.headlineLines} />
        <div className="pillar-grid">
          {cc.pillars.map((pillar, i) => (
            <Reveal className="pillar" delay={i * 50} key={pillar}>
              <span className="pillar-no">{String(i + 1).padStart(2, "0")}</span>
              {pillar}
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="lead-para">{cc.paragraph}</p>
        </Reveal>
      </div>
    </section>
  );
}

const RND_RENDER = {
  performance: { render: RndPerformance, navKey: "performance", path: "/rnd/performance" },
  "key-technology": { render: RndKeyTech, navKey: "keytech", path: "/rnd/key-technology" },
  "core-competencies": { render: RndCoreComp, navKey: "corecomp", path: "/rnd/core-competencies" },
};

function RndPage({ sub }) {
  const { c, t } = useI18n();
  const tabs = childrenOf(buildMenu(t), "/rnd");
  const key = RND_RENDER[sub] ? sub : "performance";
  const view = RND_RENDER[key];
  const Body = view.render;
  return (
    <>
      <PageHero
        title={t(`nav.${view.navKey}`)}
        desc={c.rnd.sharedHero.desc}
        image={c.rnd.sharedHero.image}
      />
      <SubNav items={tabs} active={view.path} />
      <Body />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* PR Center                                                           */
/* ------------------------------------------------------------------ */
function PrCenter() {
  const { c, t } = useI18n();
  const tabs = childrenOf(buildMenu(t), "/pr");
  return (
    <>
      <PageHero title={t("nav.prcenter")} desc={c.pr.hero.desc} image={c.pr.hero.image} />
      <SubNav items={tabs} active="/pr" />
      <section className="section">
        <div className="container">
          <SectionHead lines={c.pr.intro.headlineLines} />
          <div className="pr-card-grid">
            {c.pr.cards.map((card, i) => (
              <Reveal className="pr-card" delay={i * 80} key={card.system}>
                <div className="pr-thumb">
                  <img src={card.image} alt={card.system} loading="lazy" />
                </div>
                <div className="pr-info">
                  <span className="pr-field">{card.field}</span>
                  <h3>{card.system}</h3>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <a className="btn btn--outline" href={to("/pr/news")}>
              {t("cta.allNews2")}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PrNews() {
  const { c, t } = useI18n();
  const tabs = childrenOf(buildMenu(t), "/pr");
  return (
    <>
      <PageHero
        title={t("nav.news")}
        desc={c.pr.newsIndex.hero.desc}
        image={c.pr.newsIndex.hero.image}
      />
      <SubNav items={tabs} active="/pr/news" />
      <section className="section">
        <div className="container">
          <SectionHead title={c.pr.newsIndex.hero.desc} />
          <div className="news-list">
            {c.pr.posts.map((post, i) => (
              <Reveal className="news-row" delay={i * 60} key={post.slug}>
                <div className="news-row-thumb">
                  <img src={post.image} alt="" loading="lazy" />
                </div>
                <div>
                  <time>{post.date.replace(/-/g, ".")}</time>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                </div>
                <span className="text-link" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Footer + 404                                                        */
/* ------------------------------------------------------------------ */
function Footer() {
  const { c, t } = useI18n();
  const site = c.site;
  const menu = buildMenu(t);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo variant="dark" className="footer-logo" />
            <p>{site.tagline}</p>
          </div>
          <div className="footer-col">
            <h4>{t("footer.sitemap")}</h4>
            {menu.filter((m) => m.path !== "/").map((m) => (
              <a key={m.path} href={to(m.path)}>
                {m.label}
              </a>
            ))}
          </div>
          <div className="footer-col">
            <h4>{t("footer.contact")}</h4>
            <p>{site.contact.company}</p>
            <p>{site.contact.address}</p>
            <a href={`tel:${site.contact.phone.replace(/[^0-9+]/g, "")}`}>{site.contact.phone}</a>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.contact.company}. {t("footer.rights")}
          </span>
          <span>{site.brandFull}</span>
        </div>
      </div>
    </footer>
  );
}

function NotFound() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <h2>{t("notFound.title")}</h2>
        <p style={{ marginTop: 16, color: "var(--muted)" }}>{t("notFound.desc")}</p>
        <a className="btn btn--primary" style={{ marginTop: 28 }} href={to("/")}>
          {t("cta.home")}
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */
function useScrollToTop(route) {
  const prev = React.useRef(route);
  React.useLayoutEffect(() => {
    const [path, hash] = route.split("#");
    const prevPath = prev.current.split("#")[0];
    prev.current = route;
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    if (path !== prevPath) window.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);
}

function renderRoute(route) {
  const [path] = route.split("#");
  const parts = path.split("/").filter(Boolean);

  if (path === "/" || parts.length === 0) return <HomePage />;

  switch (parts[0]) {
    case "company":
      return <CompanyPage sub={parts[1]} />;
    case "products":
      if (!parts[1]) return <ProductsOverview />;
      return <CategoryPage slug={parts[1]} />;
    case "rnd":
      return <RndPage sub={parts[1]} />;
    case "pr":
      if (parts[1] === "news") return <PrNews />;
      return <PrCenter />;
    default:
      return <NotFound />;
  }
}

function App() {
  const { lang } = useI18n();
  const route = useHashRoute();
  useScrollToTop(route);
  const pageKey = route.split("#")[0];
  return (
    <>
      <Header route={pageKey} />
      <main key={`${pageKey}-${lang}`}>{renderRoute(route)}</main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>
);
