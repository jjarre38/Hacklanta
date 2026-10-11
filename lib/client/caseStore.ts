"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserCase } from "@/types";
import { userCaseSchema } from "@/lib/validation/case";
import { reclassify } from "@/lib/services/caseService";
import { makeId } from "@/lib/format";

// The browser copy is always the working case. Guests keep it here until cleared;
// when signed in, lib/client/account.ts mirrors every change to the user's account.

const CASE_KEY = "homepath:case";
const SESSION_KEY = "homepath:session";
export const CHANGE_EVENT = "homepath:case-changed";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = makeId("guest");
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function loadCase(): UserCase | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CASE_KEY);
    const parsed = userCaseSchema.safeParse(raw ? JSON.parse(raw) : null);
    return parsed.success ? reclassify(parsed.data) : null;
  } catch {
    return null;
  }
}

export function saveCase(c: UserCase): void {
  window.localStorage.setItem(CASE_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event(CHANGE_EVENT));

}

export function clearCase(): void {
  window.localStorage.removeItem(CASE_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** React hook: current case (or null) plus a loaded flag to avoid hydration flashes. */
export function useCase() {
  const [userCase, setUserCase] = useState<UserCase | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sync = () => setUserCase(loadCase());
    sync();
    setLoaded(true);
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((c: UserCase) => {
    saveCase(c);
    setUserCase(c);
  }, []);

  return { userCase, loaded, update };
}
