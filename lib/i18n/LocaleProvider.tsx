"use client";

import { usePathname } from "next/navigation";
import { PAGE_TITLES } from "./pageTitles";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { formatDate as date, formatMoney as money } from "@/lib/format";
import { createTranslator, localizeAuthoredText, LOCALE_COOKIE, LOCALE_KEY, validLocale, type Locale } from "./core";

function presentation(locale: Locale) {
  return {
    locale,
    tr: createTranslator(locale),
    text: (value: string | null | undefined) => localizeAuthoredText(locale, value ?? ""),
    formatMoney: (n: number | null | undefined) => money(n, locale),
    formatDate: (value: string | null | undefined, opts?: Intl.DateTimeFormatOptions) => date(value, opts, locale),
  };
}
const Context = createContext({ ...presentation("en"), setLocale: (locale: Locale) => { void locale; } });

export function LocaleProvider({ initialLocale = "en", children }: { initialLocale?: Locale; children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLanguage] = useState<Locale>(initialLocale);
  const setLocale = useCallback((next: Locale) => {
    const selected = validLocale(next);
    setLanguage(selected);
    document.documentElement.lang = selected;
    try { localStorage.setItem(LOCALE_KEY, selected); } catch { /* Storage may be disabled. */ }
    document.cookie = `${LOCALE_COOKIE}=${selected}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);
  useEffect(() => {
    // Cookie provides SSR language; localStorage also supports restricted-cookie browsers.
    try {
      const stored = localStorage.getItem(LOCALE_KEY);
      if (stored === "en" || stored === "es") setLocale(stored);
    } catch { /* Keep server-provided preference. */ }
    const sync = (event: StorageEvent) => {
      if (event.key === LOCALE_KEY) setLocale(validLocale(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [setLocale]);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { const title = PAGE_TITLES[pathname]; if (title) document.title = `${createTranslator(locale)(title)} · HomePath`; }, [locale, pathname]);
  const value = useMemo(() => ({ ...presentation(locale), setLocale }), [locale, setLocale]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useI18n = () => useContext(Context);
export function LocalizedText({ children }: { children: string }) {
  const { text } = useI18n();
  return <>{text(children)}</>;
}
export function LanguageSelector({ light = false }: { light?: boolean }) {
  const { locale, setLocale } = useI18n();
  return (
    <select aria-label="Language / Idioma" value={locale} onChange={e => setLocale(validLocale(e.target.value))}
      className={`max-w-[110px] rounded-lg border px-2 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${light ? "border-white/40 bg-[#302044] text-white" : "border-slate-300 bg-white text-ink"}`}>
      <option value="en" lang="en">English</option>
      <option value="es" lang="es">Español</option>
    </select>
  );
}
