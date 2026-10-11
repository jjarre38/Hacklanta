import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
/** Enforce the actual streamed size, including requests without Content-Length. */
export async function boundedBody(req: Request, maxBytes: number): Promise<Uint8Array> {
  if (Number(req.headers.get("content-length")) > maxBytes) throw new RequestError("Request is too large.", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new RequestError("A request body is required.", 400);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new RequestError("Request is too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}
export async function boundedJson(req: Request): Promise<unknown> {
  const bytes = await boundedBody(req, 256 * 1024);
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new RequestError("Invalid JSON.", 400); }
}

/** Resolve a Supabase access token to its user ID, or null if it isn't a valid signed-in session. */
async function supabaseUserId(token: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !token) return null;
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}

function isOperator(supplied: string): boolean {
  const token = process.env.HOMEPATH_AI_ACCESS_TOKEN;
  if (!token || token.length < 32) return false;
  const a = Buffer.from(supplied), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Live AI is for signed-in accounts (Supabase session) or the private operator token; guests stay offline.
// Per-process limits: each caller gets 5 calls a minute, and all callers together get 30.
const PER_CALLER = 5, TOTAL = 30;
let windowStart = 0; let total = 0; const perCaller = new Map<string, number>();
export async function authorizeAI(req: Request, now = Date.now(), verifyUser = supabaseUserId): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) throw new RequestError("Live AI is not configured on this server. You can enter details manually or use the labeled sample.", 503);
  const supplied = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const caller = isOperator(supplied) ? "operator" : await verifyUser(supplied).catch(() => null);
  if (!caller) throw new RequestError("Sign in to use AI features. You can still enter details manually or use the labeled sample.", 401);
  if (now - windowStart >= 60_000) { windowStart = now; total = 0; perCaller.clear(); }
  const used = perCaller.get(caller) ?? 0;
  if (used >= PER_CALLER || total >= TOTAL) throw new RequestError("AI request limit reached. Try again later.", 429);
  perCaller.set(caller, used + 1); total++;
}
export const requestError = (err: unknown) => ({ error: err instanceof RequestError ? err.message : "Invalid request." });
export const requestStatus = (err: unknown) => err instanceof RequestError ? err.status : 400;
