import type { Locale } from "./core";
/** Local device voices only: no browser-vendor cloud voice or new API expense. */
export function selectLocalVoice<T extends { lang: string; localService: boolean }>(voices: T[], locale: Locale): T | undefined {
  return voices.find(v => v.localService && v.lang.toLowerCase().split(/[-_]/)[0] === locale);
}
