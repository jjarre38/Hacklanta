import "server-only";
import { timingSafeEqual } from "node:crypto";

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

// Per-process upper bound, plus a private operator token. Public browsers never get this token.
let windowStart = 0; let calls = 0;
export function authorizeAI(req: Request, now = Date.now()): void {
  const token = process.env.HOMEPATH_AI_ACCESS_TOKEN;
  if (!process.env.ANTHROPIC_API_KEY || !token || token.length < 32) throw new RequestError("Live AI is disabled for this guest demo. You can enter details manually or use the labeled sample.", 503);
  const supplied = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const a = Buffer.from(supplied), b = Buffer.from(token);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new RequestError("This AI endpoint requires operator authorization.", 403);
  if (now - windowStart >= 60_000) { windowStart = now; calls = 0; }
  if (calls >= 5) throw new RequestError("AI request limit reached. Try again later.", 429);
  calls++;
}
export const requestError = (err: unknown) => ({ error: err instanceof RequestError ? err.message : "Invalid request." });
export const requestStatus = (err: unknown) => err instanceof RequestError ? err.status : 400;
