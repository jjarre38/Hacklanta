"use client";

import { useSyncExternalStore } from "react";

/** Below Tailwind's `lg` breakpoint — where the dashboard collapses to a single column. */
const MOBILE_QUERY = "(max-width: 1023px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * True on phone and small-tablet screens. Use it to swap in a condensed layout,
 * not for simple spacing tweaks (Tailwind breakpoints handle those without JS).
 * Always false during server render.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
