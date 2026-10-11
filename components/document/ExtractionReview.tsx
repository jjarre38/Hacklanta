"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ExtractedDocument } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type EditableKey = "landlordName" | "tenantName" | "amountClaimed" | "filingDate" | "courtDate" | "caseNumber" | "county";

const FIELDS: { key: EditableKey; label: string; type: "text" | "number" | "date" }[] = [
  { key: "landlordName", label: "Landlord", type: "text" },
  { key: "tenantName", label: "Tenant", type: "text" },
  { key: "amountClaimed", label: "Amount claimed", type: "number" },
  { key: "filingDate", label: "Date filed", type: "date" },
  { key: "courtDate", label: "Court date", type: "date" },
  { key: "caseNumber", label: "Case number", type: "text" },
  { key: "county", label: "County", type: "text" },
];

interface ExtractionReviewProps {
  extracted: ExtractedDocument;
  onConfirm: (doc: ExtractedDocument) => void;
  onCancel: () => void;
}

export function ExtractionReview({ extracted, onConfirm, onCancel }: ExtractionReviewProps) {
  const { text, tr } = useI18n();
  const [doc, setDoc] = useState<ExtractedDocument>(extracted);

  function set(key: EditableKey, raw: string, type: "text" | "number" | "date") {
    const value = raw === "" ? null : type === "number" ? Math.max(0, Number(raw)) : raw;
    setDoc((d) => ({ ...d, [key]: value }));
  }

  const confidenceTone = doc.confidence === "HIGH" ? "green" : doc.confidence === "MEDIUM" ? "amber" : "coral";

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold">{tr("We found the following information")}</p>
        <Badge tone={confidenceTone}>{tr(doc.confidence === "HIGH" ? "High" : doc.confidence === "MEDIUM" ? "Medium" : "Low")} {tr(" confidence")}</Badge>
      </div>

      {doc.confidence === "LOW" && (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            <strong>{tr("Low confidence — please verify.")}</strong> {tr(" The document was hard to read or may not be an eviction document. Check each field against your papers before saving.")}</p>
        </div>
      )}

      <p className="text-sm text-ink-muted">{tr("Check each field and correct anything that's wrong. Blank means we couldn't tell — we don't guess.")}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const value = doc[f.key];
          return (
            <div key={f.key}>
              <label htmlFor={`doc-${f.key}`} className="field-label">
                {text(f.label)}
              </label>
              <input
                id={`doc-${f.key}`}
                type={f.type}
                min={f.type === "number" ? 0 : undefined}
                className="field-input"
                placeholder={tr("Not found")}
                value={value === null || value === undefined ? "" : String(value)}
                onChange={(e) => set(f.key, e.target.value, f.type)}
              />
            </div>
          );
        })}
      </div>

      {doc.deadlines && doc.deadlines.length > 0 && (
        <div className="rounded-xl bg-brand-50 p-3">
          <p className="text-sm font-semibold text-brand-900">{tr("Deadlines mentioned in the document")}<span className="block text-xs font-normal">{tr("Original document wording is preserved in its source language.")}</span></p>
          <ul className="mt-1 list-disc pl-5 text-sm text-brand-900/80">
            {doc.deadlines.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => onConfirm(doc)} variant="secondary">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {tr(" Confirm and update my case")}</Button>
        <Button variant="ghost" onClick={onCancel}>
          {tr("Discard")}</Button>
      </div>
    </div>
  );
}
