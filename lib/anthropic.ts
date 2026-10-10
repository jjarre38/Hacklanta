import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;

export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI features.");
    this.name = "MissingApiKeyError";
  }
}

/** Server-only singleton. Throws MissingApiKeyError when no key is configured. */
export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingApiKeyError();
  if (!client) client = new Anthropic();
  return client;
}
