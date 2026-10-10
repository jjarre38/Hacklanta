"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserCase } from "@/types";
import { makeId } from "@/lib/format";

// Guest-mode persistence. The case lives in this browser's localStorage under
// an anonymous session ID. When Supabase is configured, the API also stores a
// copy keyed by the same session ID.

const CASE_KEY = "homepath:case";
const SESSION_KEY = "homepath:session";
const CHANGE_EVENT = "homepath:case-changed";

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
    return raw ? (JSON.parse(raw) as UserCase) : null;
  } catch {
    return null;
  }
}

export function saveCase(c: UserCase): void {
  window.localStorage.setItem(CASE_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  // Best-effort server sync (no-op server-side when Supabase isn't configured).
  void fetch("/api/case", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: getSessionId(), case: c }),
  }).catch(() => undefined);
}

export function clearCase(): void {
  window.localStorage.removeItem(CASE_KEY);
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
