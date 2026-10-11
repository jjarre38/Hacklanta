import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase is optional. When env vars are missing these helpers return null and
// callers fall back to localStorage (client) or skip persistence (server).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const DOCUMENTS_BUCKET = "documents";

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

let browserClient: SupabaseClient | null = null;

/** Browser-safe client using the anon key. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!browserClient) browserClient = createClient(url, anonKey);
  return browserClient;
}

// Privileged access is isolated in lib/supabaseServer.ts and is unused by guest APIs.
