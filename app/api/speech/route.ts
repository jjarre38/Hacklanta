import { NextResponse } from "next/server";
import { z } from "zod";
import { boundedJson, requestError, requestStatus } from "@/lib/services/requestSafety";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({ text: z.string().trim().min(1).max(4500), language: z.enum(["en", "es"]).default("en"), consentToVoiceProcessing: z.literal(true) });
let windowStart = 0;
let requests = 0;

export async function POST(req: Request) {
  // Only the app's own origin may initiate paid speech generation.
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json({ error: "Speech requests must come from HomePath." }, { status: 403 });
  }
  let body: unknown;
  try { body = await boundedJson(req); }
  catch (err) { return NextResponse.json(requestError(err), { status: requestStatus(err) }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide 1–4,500 characters, a supported language, and consent for external narration." }, { status: 400 });
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Voice is not configured yet. Add ELEVENLABS_API_KEY to the server environment to enable narration." }, { status: 503 });
  }
  if (Date.now() - windowStart >= 60_000) { windowStart = Date.now(); requests = 0; }
  if (requests >= 5) return NextResponse.json({ error: "The voice service is busy or its quota has been reached. Please try again later." }, { status: 429 });
  requests++;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: parsed.data.text,
        model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
      }),
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(45000)]),
      cache: "no-store",
    });
    if (!response.ok) {
      const error = response.status === 429
        ? "The voice service is busy or its quota has been reached. Please try again later."
        : response.status === 401 || response.status === 403
          ? "The voice service credentials or permissions need attention."
          : "We couldn't generate your audio. Please try again.";
      return NextResponse.json({ error }, { status: response.status === 429 ? 429 : 502 });
    }
    return new Response(response.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return NextResponse.json({ error: "The voice service could not be reached. Please try again." }, { status: 502 });
  }
}
