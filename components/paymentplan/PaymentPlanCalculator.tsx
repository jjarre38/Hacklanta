"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Calculator, Loader2, MessageSquareText, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { PaymentInstallment, PaymentPlan, UserCase } from "@/types";
import { buildPaymentPlan, sumInstallments } from "@/lib/services/paymentPlanService";
import { addDays, formatMoney, parseDate, toISODate } from "@/lib/format";
import { DRAFT_DISCLAIMER } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DraftedMessage } from "./DraftedMessage";

type Tone = "professional" | "warm";

export function PaymentPlanCalculator({ userCase }: { userCase: UserCase }) {
  const suggested = useMemo(() => buildPaymentPlan(userCase), [userCase]);
  const [plan, setPlan] = useState<PaymentPlan>(suggested);
  const [tone, setTone] = useState<Tone>("professional");
  const [tenantName, setTenantName] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");

  const scheduled = sumInstallments(plan.installments);
  const remaining = plan.totalOwed - scheduled;

  function updateInstallment(index: number, patch: Partial<PaymentInstallment>) {
    setPlan((p) => ({ ...p, installments: p.installments.map((inst, i) => (i === index ? { ...inst, ...patch } : inst)) }));
  }

  function addInstallment() {
    setPlan((p) => {
      const last = p.installments[p.installments.length - 1];
      const date = last ? addDays(parseDate(last.dueDate), 14) : addDays(new Date(), 14);
      return {
        ...p,
        installments: [...p.installments, { amount: Math.max(0, p.totalOwed - sumInstallments(p.installments)), dueDate: toISODate(date), label: `Installment ${p.installments.length + 1}` }],
      };
    });
  }

  function removeInstallment(index: number) {
    setPlan((p) => ({ ...p, installments: p.installments.filter((_, i) => i !== index) }));
  }

  async function draft() {
    setDrafting(true);
    setDraftError(null);
    try {
      const res = await fetch("/api/draft-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalOwed: plan.totalOwed,
          installments: plan.installments.filter((i) => i.amount > 0),
          tone,
          tenantName: tenantName.trim() || undefined,
          landlordName: userCase.landlordName || undefined,
          context: {
            incomeRecentlyReduced: userCase.incomeRecentlyReduced,
            assistanceApplied: userCase.appliedForAssistance,
            assistanceStatus: userCase.assistanceStatus,
            caseFiled: ["EVICTION_FILED", "COURT_DATE_SCHEDULED", "JUDGMENT_ENTERED"].includes(userCase.evictionStage),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't draft the message.");
      setSubject(data.subject);
      setPlan((p) => ({ ...p, proposalText: data.message }));
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : "Couldn't draft the message.");
    } finally {
      setDrafting(false);
    }
  }

  const balanced = remaining === 0;
  const canDraft = balanced && plan.installments.some((i) => i.amount > 0);

  return (
    <Card id="payment-plan" className="scroll-mt-24">
      <CardHeader
        icon={<Calculator className="h-5 w-5" />}
        title="Payment plan calculator"
        description="We suggested a schedule from your paychecks. Adjust any amount or date."
        action={
          <Button variant="ghost" size="sm" onClick={() => setPlan(suggested)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-ink-muted">Total owed</p>
          <p className="text-lg font-bold tabular-nums">{formatMoney(plan.totalOwed)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-ink-muted">Scheduled</p>
          <p className="text-lg font-bold tabular-nums">{formatMoney(scheduled)}</p>
        </div>
        <div className={clsx("rounded-xl p-3", balanced ? "bg-sage-50" : "bg-amber-50")}>
          <p className="text-xs text-ink-muted">{remaining < 0 ? "Over by" : "Remaining"}</p>
          <p className={clsx("text-lg font-bold tabular-nums", balanced ? "text-sage-700" : "text-amber-800")} aria-live="polite">
            {balanced ? "$0 ✓" : formatMoney(Math.abs(remaining))}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {plan.installments.map((inst, i) => (
          <li key={i} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-ink-muted" htmlFor={`inst-label-${i}`}>
                Payment
              </label>
              <input
                id={`inst-label-${i}`}
                className="field-input mt-1 py-2"
                value={inst.label}
                maxLength={60}
                onChange={(e) => updateInstallment(i, { label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted" htmlFor={`inst-amount-${i}`}>
                Amount
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">$</span>
                <input
                  id={`inst-amount-${i}`}
                  type="number"
                  min={0}
                  inputMode="decimal"
                  className="field-input py-2 pl-7 tabular-nums"
                  value={Number.isFinite(inst.amount) ? inst.amount : ""}
                  onChange={(e) => updateInstallment(i, { amount: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted" htmlFor={`inst-date-${i}`}>
                Date
              </label>
              <input
                id={`inst-date-${i}`}
                type="date"
                className="field-input mt-1 py-2"
                value={inst.dueDate}
                onChange={(e) => e.target.value && updateInstallment(i, { dueDate: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeInstallment(i)}
              className="flex h-11 w-11 items-center justify-center self-end rounded-lg text-ink-muted hover:bg-slate-100 hover:text-coral-600"
              aria-label={`Remove ${inst.label}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" className="mt-3" onClick={addInstallment} disabled={plan.installments.length >= 12}>
        <Plus className="h-4 w-4" aria-hidden /> Add payment
      </Button>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-sm font-semibold">Draft a message to your landlord</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="tenant-name" className="field-label">
              Your name (optional)
            </label>
            <input id="tenant-name" className="field-input" value={tenantName} maxLength={80} onChange={(e) => setTenantName(e.target.value)} />
          </div>
          <div>
            <span className="field-label">Tone</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tone">
              {(["professional", "warm"] as Tone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tone === t}
                  onClick={() => setTone(t)}
                  className={clsx(
                    "min-h-[48px] rounded-xl border px-3 text-sm font-medium capitalize",
                    tone === t ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500" : "border-slate-300 bg-white",
                  )}
                >
                  {t === "professional" ? "Professional" : "Warm & respectful"}
                </button>
              ))}
            </div>
          </div>
        </div>
        {!balanced && <p className="mt-3 text-sm text-amber-800">Adjust the payments so they add up to {formatMoney(plan.totalOwed)} before drafting.</p>}
        <Button className="mt-4 w-full sm:w-auto" onClick={draft} disabled={!canDraft || drafting}>
          {drafting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MessageSquareText className="h-4 w-4" aria-hidden />}
          {drafting ? "Drafting your message…" : plan.proposalText ? "Redraft message" : "Draft Message to Landlord"}
        </Button>
        {draftError && (
          <p className="mt-3 rounded-xl bg-coral-50 p-3 text-sm text-coral-700" role="alert">
            {draftError}
          </p>
        )}
        {plan.proposalText !== undefined ? (
          <DraftedMessage subject={subject} message={plan.proposalText} onChange={(m) => setPlan((p) => ({ ...p, proposalText: m }))} />
        ) : (
          <p className="mt-3 text-xs text-ink-muted">{DRAFT_DISCLAIMER}</p>
        )}
      </div>
    </Card>
  );
}
