"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2, Square } from "lucide-react";
import type { ActionItem, UserCase } from "@/types";
import { STATUS_META } from "@/lib/engine/caseClassifier";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function VoicePlan({ userCase, actions }: { userCase: UserCase; actions: ActionItem[] }) {
  const remaining = actions.filter((action) => !action.completed).slice(0, 5);
  const narration = [
    "Let's take this one step at a time. Here is your HomePath plan.",
    `Your current focus is ${STATUS_META[userCase.caseStatus].label}.`,
    ...remaining.map((action, index) => `Step ${index + 1}. ${action.title}. ${action.description} ${action.reason}`),
    remaining.length ? "You can find the details and resources in your action plan below." : "You've completed the actions in your current plan. Keep your case updated as your situation changes.",
    "HomePath provides general legal information, not legal advice. Resource availability and assistance estimates are demo data.",
  ].join("\n\n").slice(0, 4500);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef<AbortController | null>(null);
  const lastNarration = useRef(narration);
  const url = useRef<string | null>(null);

  function stop() {
    request.current?.abort();
    request.current = null;
    audio.current?.pause();
    setBusy(false);
  }

  async function listen(text: string) {
    stop();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError(null);
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setAudioUrl(null);
    try {
      const response = await fetch("/api/speech", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }), signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "We couldn't generate your audio. Please try again.");
      }
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      url.current = URL.createObjectURL(blob);
      setAudioUrl(url.current);
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Audio is unavailable. Please try again.");
    } finally {
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }

  useEffect(() => {
    if (!audioUrl) return;
    audio.current?.play().catch(() => setError("Your audio is ready. Press play below to listen."));
  }, [audioUrl]);

  useEffect(() => {
    if (lastNarration.current === narration) return;
    lastNarration.current = narration;
    stop();
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setAudioUrl(null);
    setError(null);
  }, [narration]);

  useEffect(() => () => {
    request.current?.abort();
    if (url.current) URL.revokeObjectURL(url.current);
  }, []);

  return (
    <Card className="mt-6 border-violet-200 bg-violet-50/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-violet-950"><Volume2 className="h-5 w-5 text-violet-700" aria-hidden /> Listen to your plan</h2>
          <p className="mt-1 text-sm text-ink-soft">A calm voice walks you through your next steps. Powered by ElevenLabs.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void listen(narration)} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
            {busy ? "Creating audio…" : "Read my plan"}
          </Button>
          {(busy || audioUrl) && <Button variant="outline" onClick={stop}><Square className="h-4 w-4" aria-hidden /> Stop</Button>}
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted">When you listen, your plan summary is sent to ElevenLabs to generate speech.</p>
      {audioUrl && <audio ref={audio} src={audioUrl} controls className="mt-4 w-full" aria-label="Your HomePath plan narration" onError={() => setError("Audio playback failed. Please try generating it again.")} />}
      {error && <p role="status" className="mt-3 text-sm text-ink-soft">{error}</p>}
    </Card>
  );
}
