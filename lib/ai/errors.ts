import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { MissingApiKeyError } from "@/lib/anthropic";

/** Claude declined (stop_reason "refusal") or returned unusable output. */
export class AIRefusedError extends Error {}

/** Maps AI failures to user-safe messages and status codes. */
export function aiErrorResponse(err: unknown, route: string): [{ error: string }, { status: number }] {
  if (err instanceof MissingApiKeyError) {
    return [{ error: "AI features aren't configured. Add ANTHROPIC_API_KEY to .env.local and restart the server." }, { status: 503 }];
  }
  if (err instanceof AIRefusedError) {
    return [{ error: err.message }, { status: 422 }];
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return [{ error: "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY." }, { status: 503 }];
  }
  if (err instanceof Anthropic.RateLimitError) {
    return [{ error: "The AI service is busy. Please try again in a minute." }, { status: 429 }];
  }
  if (err instanceof Anthropic.BadRequestError) {
    console.error(`[${route}] Anthropic bad request`, err.message);
    return [{ error: "The AI service couldn't process this request. If you uploaded a file, try a clearer PDF or photo." }, { status: 400 }];
  }
  if (err instanceof Anthropic.APIError) {
    console.error(`[${route}] Anthropic API error`, err.status, err.message);
    return [{ error: "The AI service had a problem. Please try again." }, { status: 502 }];
  }
  console.error(`[${route}]`, err);
  return [{ error: "Something went wrong. Please try again." }, { status: 500 }];
}
