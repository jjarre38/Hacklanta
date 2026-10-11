"use client";

import { useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { UserCase } from "@/types";
import { userCaseSchema } from "@/lib/validation/case";
import { reclassify } from "@/lib/services/caseService";
import { DEMO_ACCOUNT } from "@/lib/demo/demoAccount";
import { getSupabaseBrowser } from "./supabaseBrowser";
import { CHANGE_EVENT, clearCase, loadCase, saveCase } from "./caseStore";

// Accounts and case sync.
//
// The browser copy (caseStore) stays the working case so every page works the same
// signed in or not. While signed in:
//   - signing in loads the account's saved case, or saves the current guest case to the account if it has none;
//   - every local change is pushed to the account (clearing the case deletes the saved copy);
//   - signing out removes the case from this browser so the next person on a shared device can't see it.

export type AccountStatus = "unconfigured" | "loading" | "signed-out" | "signed-in";
export type SyncStatus = "idle" | "syncing" | "saved" | "error";

export interface AccountState {
  status: AccountStatus;
  email: string | null;
  sync: SyncStatus;
  syncError: string | null;
}

const TABLE = "account_cases";
const INITIAL: AccountState = { status: "loading", email: null, sync: "idle", syncError: null };

let state: AccountState = INITIAL;
let user: User | null = null;
let started = false;
/** True while writing the account's case into the browser, so that write isn't pushed straight back. */
let applyingRemote = false;
/** Pushes run one at a time, in order, so an older save can't land after a newer one. */
let queue: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();

function setState(patch: Partial<AccountState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function withoutPush(fn: () => void) {
  applyingRemote = true;
  try {
    fn();
  } finally {
    applyingRemote = false;
  }
}

function syncFailed(message: string) {
  setState({ sync: "error", syncError: message });
}

/** Start listening for sign-in changes. Safe to call repeatedly; mounted once from the nav. */
export function startAccountSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    setState({ status: "unconfigured" });
    return;
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    // Supabase warns against awaiting its own calls inside this callback (it can deadlock), so defer.
    setTimeout(() => void handleSession(session), 0);
  });
  window.addEventListener(CHANGE_EVENT, onLocalChange);
}

async function handleSession(session: Session | null) {
  const next = session?.user ?? null;
  if (next && next.id === user?.id) return; // Token refresh for the same user.

  if (!next) {
    const wasSignedIn = user !== null;
    user = null;
    setState({ status: "signed-out", email: null, sync: "idle", syncError: null });
    if (wasSignedIn) withoutPush(clearCase);
    return;
  }

  user = next;
  setState({ status: "signed-in", email: next.email ?? null, sync: "syncing", syncError: null });
  await pullCase(next);
}

async function pullCase(forUser: User) {
  const supabase = getSupabaseBrowser()!;
  const { data, error } = await supabase.from(TABLE).select("data").eq("user_id", forUser.id).maybeSingle();
  if (user?.id !== forUser.id) return; // Signed out or switched while loading.
  if (error) return syncFailed("Couldn't load your saved plan. Your changes are kept in this browser for now.");

  if (data) {
    const parsed = userCaseSchema.safeParse(data.data);
    if (!parsed.success) return syncFailed("Your saved plan couldn't be read. Start a new plan to replace it.");
    withoutPush(() => saveCase(reclassify(parsed.data)));
    setState({ sync: "saved" });
    return;
  }

  // New account: keep whatever the person built as a guest.
  const local = loadCase();
  if (local) enqueue(() => pushCase(forUser, local));
  else setState({ sync: "idle" });
}

function onLocalChange() {
  if (applyingRemote || !user) return;
  const forUser = user;
  const c = loadCase();
  enqueue(() => (c ? pushCase(forUser, c) : deleteCase(forUser)));
}

function enqueue(task: () => Promise<void>) {
  setState({ sync: "syncing", syncError: null });
  queue = queue.then(task, task);
}

async function pushCase(forUser: User, c: UserCase) {
  const { error } = await getSupabaseBrowser()!
    .from(TABLE)
    .upsert({ user_id: forUser.id, data: c, updated_at: new Date().toISOString() });
  if (user?.id !== forUser.id) return;
  if (error) syncFailed("Couldn't save to your account. Your changes are kept in this browser.");
  else setState({ sync: "saved" });
}

async function deleteCase(forUser: User) {
  const { error } = await getSupabaseBrowser()!.from(TABLE).delete().eq("user_id", forUser.id);
  if (user?.id !== forUser.id) return;
  if (error) syncFailed("Couldn't remove the saved plan from your account.");
  else setState({ sync: "idle" });
}

// ------------------------------------------------------------------ actions

/** Turn Supabase's messages into plain language for the forms. */
function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match an account.";
  if (/email not confirmed/i.test(message)) return "Please confirm your email first — check your inbox for the link.";
  if (/already registered/i.test(message)) return "An account with that email already exists. Try signing in.";
  if (/password/i.test(message)) return message;
  return "Something went wrong. Please try again.";
}

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: "Accounts aren't set up yet." };
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error ? { error: friendly(error.message) } : {};
}

/** Returns `needsConfirmation` when the Supabase project requires email confirmation before first sign-in. */
export async function signUp(email: string, password: string): Promise<{ error?: string; needsConfirmation?: boolean }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: "Accounts aren't set up yet." };
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) return { error: friendly(error.message) };
  return { needsConfirmation: !data.session };
}

export function signInDemo() {
  return signIn(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
}

export async function signOut() {
  await getSupabaseBrowser()?.auth.signOut();
}

// ------------------------------------------------------------------ hook

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current account and sync state. */
export function useAccount(): AccountState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}
