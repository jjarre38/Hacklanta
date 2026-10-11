"use client";

import { selectLocalVoice } from "@/lib/i18n/speech";
import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Loader2, Volume2, Square } from "lucide-react";
import type { ActionItem, UserCase } from "@/types";
import { STATUS_META } from "@/lib/engine/caseClassifier";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** `compact` is the mobile layout: no top margin, shorter copy, and full-width buttons. */
export function VoicePlan({ userCase, actions, compact = false }: { userCase: UserCase; actions: ActionItem[]; compact?: boolean }) {
  const { locale, text, tr } = useI18n();
  const remaining = actions.filter((action) => !action.completed).slice(0, 5);
  const narration = [
    tr("Let's take this one step at a time. Here is your HomePath plan."),
    tr("Your current focus is {0}.", { 0: text(STATUS_META[userCase.caseStatus].label) }),
    ...remaining.map((action, index) => tr("Step {0}. {1}. {2} {3}", { 0: index + 1, 1: action.title, 2: action.description, 3: action.reason })),
    remaining.length ? tr("You can find the details and resources in your action plan below.") : tr("You've completed the actions in your current plan. Keep your case updated as your situation changes."),
    tr("HomePath provides general legal information, not legal advice. Resource availability and assistance estimates are demo data."),
  ].join("\n\n").slice(0, 4500);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [provider, setProvider] = useState<"browser" | "elevenlabs">("browser");
  const [consent, setConsent] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef<AbortController | null>(null);
  const lastNarration = useRef(narration);
  const url = useRef<string | null>(null);

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    request.current?.abort();
    request.current = null;
    audio.current?.pause();
    setBusy(false);
  }

  async function listen(content: string) {
    stop();
    setError(null);
    if (provider === "browser") {
      const voice = selectLocalVoice(voices, locale);
      if (!voice || !("speechSynthesis" in window)) { setError("No local voice is available for this language. Install a device voice or choose optional ElevenLabs narration."); return; }
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.voice = voice;
      utterance.lang = locale === "es" ? "es-US" : "en-US";
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = event => { setSpeaking(false); if (event.error !== "canceled" && event.error !== "interrupted") setError("Audio is unavailable. Please try again."); };
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
      return;
    }
    if (!consent) return;
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
        body: JSON.stringify({ text: content, language: locale, consentToVoiceProcessing: true }), signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || tr("We couldn't generate your audio. Please try again."));
      }
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      url.current = URL.createObjectURL(blob);
      setAudioUrl(url.current);
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : tr("Audio is unavailable. Please try again."));
    } finally {
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => { window.speechSynthesis.removeEventListener("voiceschanged", update); window.speechSynthesis.cancel(); };
  }, []);

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
    <Card className={clsx("border-brand-200 bg-brand-50/40", !compact && "mt-6")}>
      <div className={clsx("flex flex-col sm:flex-row sm:items-center sm:justify-between", compact ? "gap-3" : "gap-4")}>
        <div>
          <h2 className={clsx("flex items-center gap-2 font-semibold", compact ? "text-base" : "text-lg")}><Volume2 className="h-5 w-5 text-brand-600" aria-hidden /> {tr(" Listen to your plan")}</h2>
          <p className="mt-1 text-sm text-ink-soft">{compact ? tr("Hear your next steps read aloud.") : tr("Listen using a local device voice, or choose optional ElevenLabs narration.")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void listen(narration)} disabled={busy || (provider === "elevenlabs" && !consent)} className={clsx(compact && "flex-1")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
            {busy ? tr("Creating audio…") : tr("Read my plan")}
          </Button>
          {(busy || audioUrl || speaking) && <Button variant="outline" onClick={stop}><Square className="h-4 w-4" aria-hidden /> {tr(" Stop")}</Button>}
        </div>
      </div>
      <div className="mt-3 space-y-2 text-xs text-ink-muted">
        <label className="flex flex-wrap items-center gap-2">{tr("Voice source")}
          <select value={provider} onChange={e => { stop(); setProvider(e.target.value as "browser" | "elevenlabs"); setConsent(false); }} className="rounded border border-slate-300 bg-white px-2 py-1 text-ink">
            <option value="browser">{tr("Device voice (free, local)")}</option>
            <option value="elevenlabs">{tr("ElevenLabs (optional external service)")}</option>
          </select>
        </label>
        {provider === "browser" && !selectLocalVoice(voices, locale) && <p role="status">{tr("No local voice is available for this language. Install a device voice or choose optional ElevenLabs narration.")}</p>}
        {provider === "elevenlabs" && <label className="flex items-start gap-2"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />{tr("I agree to send my plan summary to ElevenLabs when I press Read my plan. The site operator pays API charges.")}</label>}
      </div>
      {audioUrl && <audio ref={audio} src={audioUrl} controls className="mt-4 w-full" aria-label={tr("Your HomePath plan narration")} onError={() => setError("Audio playback failed. Please try generating it again.")} />}
      {error && <p role="status" className="mt-3 text-sm text-ink-soft">{text(error)}</p>}
    </Card>
  );
}
