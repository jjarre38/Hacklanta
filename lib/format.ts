import { type Locale, localeTag } from "./i18n/core";
// Small display helpers shared across the app.

const currencies = { en: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), es: new Intl.NumberFormat("es-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) };

export function formatMoney(n: number | undefined | null, locale: Locale = "en"): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return currencies[locale].format(n);
}

/** Civil dates use Metro Atlanta time, independently of the server timezone. */
export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return isISODate(value) ? new Date(`${value}T12:00:00Z`) : new Date(NaN);
  return new Date(value);
}

export function formatDate(value: string | undefined | null, opts?: Intl.DateTimeFormatOptions, locale: Locale = "en"): string {
  if (!value) return "—";
  const d = parseDate(value);
  if (!Number.isFinite(d.getTime())) return locale === "es" ? "Fecha desconocida" : "Unknown date";
  return d.toLocaleDateString(localeTag(locale), { ...(opts ?? { month: "short", day: "numeric", year: "numeric" }), timeZone: "America/New_York" });
}

export function toISODate(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addDays(d: Date, days: number): Date {
  const copy = parseDate(toISODate(d));
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/** Calendar-day difference; never a computed legal deadline. */
export function daysUntil(date: string | undefined, now: Date = new Date()): number | null {
  if (!date || !isISODate(date)) return null;
  return Math.round((parseDate(date).getTime() - parseDate(toISODate(now)).getTime()) / 86_400_000);
}

export function makeId(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${rand}`;
}
