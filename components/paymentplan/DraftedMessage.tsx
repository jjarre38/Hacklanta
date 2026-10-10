"use client";

import { useState } from "react";
import { Check, Copy, Info } from "lucide-react";
import { DRAFT_DISCLAIMER } from "@/lib/copy";
import { Button } from "@/components/ui/Button";

export function DraftedMessage({ subject, message, onChange }: { subject: string; message: string; onChange: (m: string) => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(subject ? `Subject: ${subject}\n\n${message}` : message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="animate-fade-up mt-5 rounded-2xl border border-brand-200 bg-brand-50/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Your drafted message</p>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="h-4 w-4 text-sage-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {subject && (
        <p className="mt-3 text-sm">
          <span className="font-semibold">Subject:</span> {subject}
        </p>
      )}
      <label htmlFor="drafted-message" className="sr-only">
        Drafted message (editable)
      </label>
      <textarea
        id="drafted-message"
        value={message}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="field-input mt-2 font-[inherit] leading-relaxed"
      />
      <p className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {DRAFT_DISCLAIMER} Review and edit before sending, and keep a copy.
      </p>
    </div>
  );
}
