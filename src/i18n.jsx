import React from "react";
import * as krContent from "./data/content.kr";
import * as enContent from "./data/content.en";
import * as cnContent from "./data/content.cn";
import { ui } from "./data/ui";

export const LANGS = ["kr", "en", "cn"];
export const LANG_LABELS = { kr: "한국어", en: "English", cn: "中文" };
// Internal lang code -> valid html lang attribute value.
const HTML_LANG = { kr: "ko", en: "en", cn: "zh-CN" };

const CONTENT = { kr: krContent, en: enContent, cn: cnContent };
const STORE_KEY = "hits-lang";

const I18nContext = React.createContext(null);

function readLang() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch (e) {
    /* ignore */
  }
  return "kr";
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

export function LangProvider({ children }) {
  const [lang, setLangState] = React.useState(readLang);

  React.useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang] || "ko";
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }, [lang]);

  const setLang = React.useCallback((next) => {
    if (LANGS.includes(next)) setLangState(next);
  }, []);

  const value = React.useMemo(() => {
    const dict = ui[lang] || ui.kr;
    const t = (path) => {
      const v = getPath(dict, path);
      return v === undefined ? getPath(ui.kr, path) : v;
    };
    return { lang, setLang, t, c: CONTENT[lang] || CONTENT.kr };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LangProvider");
  return ctx;
}
