"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { CaseUpdate, CaseUpdateType } from "@/types";
import { UPDATE_OPTIONS } from "@/lib/services/caseService";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";

const GROUPS = ["Landlord", "Assistance", "Legal", "Housing"] as const;

export function CaseUpdatePanel({ onSubmit }: { onSubmit: (u: CaseUpdate) => void }) {
  const { text, tr } = useI18n();
  const [type, setType] = useState<CaseUpdateType | "">("");
  const [courtDate, setCourtDate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return setError("Choose what changed.");
    if (type === "COURT_DATE_SET" && !courtDate) return setError("Enter the court date.");
    if (type === "PAYMENT_MADE" && !(Number(amountPaid) > 0)) return setError("Enter the amount you paid.");
    setError(null);
    onSubmit({
      type,
      courtDate: courtDate || undefined,
      amountPaid: amountPaid ? Number(amountPaid) : undefined,
      note: note.trim() || undefined,
    });
    setType("");
    setCourtDate("");
    setAmountPaid("");
    setNote("");
  }

  return (
    <Card>
      <CardHeader
        icon={<RefreshCw className="h-5 w-5" />}
        title={tr("Update my case")}
        description={tr("Tell us what changed — your status and plan will recalculate right away.")}
      />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="update-type" className="field-label">
            {tr("What happened?")}</label>
          <select id="update-type" className="field-input" value={type} onChange={(e) => setType(e.target.value as CaseUpdateType)}>
            <option value="">{tr("Choose an update")}</option>
            {GROUPS.map((g) => (
              <optgroup key={g} label={text(g)}>
                {UPDATE_OPTIONS.filter((o) => o.group === g).map((o) => (
                  <option key={o.type} value={o.type}>
                    {text(o.label)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {type === "COURT_DATE_SET" && (
          <div>
            <label htmlFor="update-court" className="field-label">
              {tr("Court date")}</label>
            <input id="update-court" type="date" className="field-input" value={courtDate} onChange={(e) => setCourtDate(e.target.value)} />
          </div>
        )}
        {type === "PAYMENT_MADE" && (
          <div>
            <label htmlFor="update-amount" className="field-label">
              {tr("Amount paid")}</label>
            <input
              id="update-amount"
              type="number"
              min={1}
              inputMode="decimal"
              className="field-input"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
        )}
        <div>
          <label htmlFor="update-note" className="field-label">
            {tr("Note (optional)")}</label>
          <input id="update-note" className="field-input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
        </div>
        {error && (
          <p className="field-error" role="alert">
            {text(error)}
          </p>
        )}
        <Button type="submit" className="w-full">
          {tr("Update and recalculate my plan")}</Button>
      </form>
    </Card>
  );
}
