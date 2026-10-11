import spanish from "./es.json";

export type Locale = "en" | "es";
export type MessageKey = keyof typeof spanish;
export type MessageValues = Record<string, string | number>;
export const LOCALE_KEY = "homepath-language";
export const LOCALE_COOKIE = "homepath-language";
export const localeTag = (locale: Locale) => locale === "es" ? "es-US" : "en-US";
export const validLocale = (value: unknown): Locale => value === "es" ? "es" : "en";

/** English source text is the fallback key. Values are interpolated once, never interpreted as HTML. */
export function translate(locale: Locale, key: string, values: MessageValues = {}): string {
  const template = locale === "es" ? (spanish as Record<string, string>)[key] ?? key : key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match);
}
export const createTranslator = (locale: Locale) => (key: string, values?: MessageValues) => translate(locale, key, values);

// Read-only adapter for existing English presentation outputs (resource reasons,
// validation errors, and legacy system descriptions). Only bundled templates match.
// Never use this on user notes, names, uploaded text, or editable message bodies.
const templates = Object.keys(spanish).filter(key => /\{\d+\}/.test(key)).map(key => {
  const names: string[] = [];
  const parts = key.split(/(\{\d+\})/g).map(part => {
    if (/^\{\d+\}$/.test(part)) { names.push(part.slice(1, -1)); return "(.+?)"; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });
  return { key, names, regex: new RegExp("^" + parts.join("") + "$", "s") };
});
const lowerKeys = new Map(Object.keys(spanish).filter(key => !key.includes("{")).map(key => [key.toLowerCase(), key]));
export function localizeAuthoredText(locale: Locale, text: string, depth = 0): string {
  if (locale === "en" || !text || depth > 4) return text;
  if (Object.prototype.hasOwnProperty.call(spanish, text)) return translate(locale, text);
  const lowerKey = lowerKeys.get(text);
  if (lowerKey) return translate(locale, lowerKey).toLocaleLowerCase("es-US");
  for (const { key, names, regex } of templates) {
    const match = regex.exec(text);
    if (match) return translate(locale, key, Object.fromEntries(names.map((name, i) => [name, localizeAuthoredText(locale, match[i + 1], depth + 1)])));
  }
  return text;
}
