"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useRef, useState } from "react";
import { FileText, Loader2, Sparkles, Upload } from "lucide-react";
import type { ExtractedDocument } from "@/types";
import { getSessionId } from "@/lib/client/caseStore";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ExtractionReview } from "./ExtractionReview";

type Phase = { kind: "idle" } | { kind: "uploading"; progress: number; label: string } | { kind: "reading"; label: string } | { kind: "review"; extracted: ExtractedDocument } | { kind: "done" };

/** POST to /api/document with upload progress (fetch can't report it). */
function send(form: FormData, onProgress: (pct: number) => void): Promise<{ extracted: ExtractedDocument }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/document");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.upload.onload = () => onProgress(100);
    xhr.onload = () => {
      let data: { extracted?: ExtractedDocument; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* handled below */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.extracted) resolve({ extracted: data.extracted });
      else reject(new Error(data.error ?? "We couldn't read that document. Please try again."));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.send(form);
  });
}

export function DocumentUpload({ onApply }: { onApply: (doc: ExtractedDocument) => void }) {
  const { text, tr } = useI18n();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function run(form: FormData, label: string) {
    setError(null);
    form.set("sessionId", getSessionId());
    setPhase({ kind: "uploading", progress: 0, label });
    try {
      const { extracted } = await send(form, (progress) =>
        setPhase(progress >= 100 ? { kind: "reading", label } : { kind: "uploading", progress, label }),
      );
      setPhase({ kind: "review", extracted });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase({ kind: "idle" });
    }
  }

  function onFile(file: File | undefined) {
    if (!file || !consent) return;
    const form = new FormData();
    form.set("file", file);
    form.set("consentToAIProcessing", "true");
    void run(form, file.name);
    if (inputRef.current) inputRef.current.value = "";
  }

  function loadDemo() {
    const form = new FormData();
    form.set("demo", "1");
    void run(form, tr("Sample eviction summons (demo)"));
  }

  return (
    <Card>
      <CardHeader
        icon={<FileText className="h-5 w-5" />}
        title={tr("Have a notice or court papers?")}
        description={tr("Upload a PDF or photo and we'll pull out the key dates and amounts. You review everything before it's saved.")}
      />

      {phase.kind === "idle" && (
        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-ink-soft"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" />{tr("I agree to send this document to Anthropic for extraction. Original text and facts are preserved; I will review the result. The labeled demo sample works without AI or consent.")}</label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-brand-400 hover:bg-brand-50/50">
            <Upload className="h-7 w-7 text-brand-600" aria-hidden />
            <span className="font-semibold text-ink">{tr("Choose a file or take a photo")}</span>
            <span className="text-sm text-ink-muted">{tr("PDF, JPG, PNG, or WebP · up to 10 MB")}</span>
            <input
              ref={inputRef}
              type="file"
              disabled={!consent}
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          <Button variant="outline" size="sm" onClick={loadDemo} className="w-full border-dashed border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100">
            <Sparkles className="h-4 w-4" aria-hidden /> {tr(" Demo Document: use a sample eviction summons")}</Button>
          <p className="text-xs text-ink-muted">{tr("Documents are read by AI to extract fields. Only upload papers about your housing case — no IDs or bank statements.")}</p>
        </div>
      )}

      {(phase.kind === "uploading" || phase.kind === "reading") && (
        <div className="space-y-3 py-4" aria-live="polite">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden />
            {phase.kind === "uploading" ? tr("Uploading {0}…", { 0: phase.label }) : tr("Reading {0}… this can take up to a minute.", { 0: phase.label })}
          </p>
          <ProgressBar value={phase.kind === "uploading" ? phase.progress : 100} />
        </div>
      )}

      {phase.kind === "review" && (
        <ExtractionReview
          extracted={phase.extracted}
          onCancel={() => setPhase({ kind: "idle" })}
          onConfirm={(doc) => {
            onApply(doc);
            setPhase({ kind: "done" });
          }}
        />
      )}

      {phase.kind === "done" && (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-sage-50 p-4 text-sm text-sage-800">
          <p className="font-medium">{tr("Your case was updated with the confirmed details.")}</p>
          <Button size="sm" variant="ghost" onClick={() => setPhase({ kind: "idle" })}>
            {tr("Upload another document")}</Button>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-coral-50 p-3 text-sm text-coral-700" role="alert">
          {text(error)}
        </p>
      )}
    </Card>
  );
}
