"use client";

import { landlordTemplate } from "@/lib/i18n/landlordTemplate";
import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Calculator, Loader2, MessageSquareText, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { PaymentInstallment, PaymentPlan, UserCase } from "@/types";
import { buildPaymentPlan, sumInstallments } from "@/lib/services/paymentPlanService";
import { addDays, parseDate, toISODate } from "@/lib/format";
import { DRAFT_DISCLAIMER } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Expandable } from "@/components/ui/Expandable";
import { DraftedMessage } from "./DraftedMessage";

type Tone = "professional" | "warm";

export function PaymentPlanCalculator({ userCase }: { userCase: UserCase }) {
  const { locale, text, tr, formatMoney } = useI18n();
  const suggested = useMemo(() => buildPaymentPlan(userCase), [userCase]);
  const [plan, setPlan] = useState<PaymentPlan>(suggested);
  const [tone, setTone] = useState<Tone>("professional");
  const [tenantName, setTenantName] = useState("");
  const [consent, setConsent] = useState(false);
  const [customLabels, setCustomLabels] = useState<Set<string>>(new Set());
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");

  const scheduled = sumInstallments(plan.installments);
  const remaining = plan.totalOwed - scheduled;

  function updateInstallment(index: number, patch: Partial<PaymentInstallment>) {
    setPlan((p) => ({ ...p, installments: p.installments.map((inst, i) => (i === index ? { ...inst, ...patch } : inst)) }));
  }

  // Focus a newly added payment row. This also expands the list if it's collapsed, so the new row is never hidden.
  const focusNewRow = useRef(false);
  useEffect(() => {
    if (!focusNewRow.current) return;
    focusNewRow.current = false;
    document.getElementById(`inst-amount-${plan.installments.length - 1}`)?.focus();
  }, [plan.installments.length]);

  function addInstallment() {
    focusNewRow.current = true;
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
    if (!consent) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const res = await fetch("/api/draft-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: locale,
          consentToAIProcessing: consent,
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
      if (!res.ok) throw new Error(data.error ?? tr("Couldn't draft the message."));
      setSubject(data.subject);
      setPlan((p) => ({ ...p, proposalText: data.message }));
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : "Couldn't draft the message.");
    } finally {
      setDrafting(false);
    }
  }

  function draftOffline() {
    const result = landlordTemplate({ totalOwed: plan.totalOwed, installments: plan.installments, tenantName: tenantName.trim(), landlordName: userCase.landlordName }, locale);
    setSubject(result.subject);
    setPlan(p => ({ ...p, proposalText: result.message }));
    setDraftError(null);
  }

  const balanced = remaining === 0;
  const canDraft = balanced && plan.installments.some((i) => i.amount > 0);

  return (
    <Card id="payment-plan" className="scroll-mt-24">
      <CardHeader
        icon={<Calculator className="h-5 w-5" />}
        title={tr("Payment plan calculator")}
        description={tr("We suggested a schedule from your paychecks. Adjust any amount or date.")}
        action={
          <Button variant="ghost" size="sm" onClick={() => setPlan(suggested)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> {tr(" Reset")}</Button>
        }
      />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-ink-muted">{tr("Total owed")}</p>
          <p className="text-lg font-bold tabular-nums">{formatMoney(plan.totalOwed)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-ink-muted">{tr("Scheduled")}</p>
          <p className="text-lg font-bold tabular-nums">{formatMoney(scheduled)}</p>
        </div>
        <div className={clsx("rounded-xl p-3", balanced ? "bg-sage-50" : "bg-amber-50")}>
          <p className="text-xs text-ink-muted">{remaining < 0 ? tr("Over by") : tr("Remaining")}</p>
          <p className={clsx("text-lg font-bold tabular-nums", balanced ? "text-sage-700" : "text-amber-800")} aria-live="polite">
            {balanced ? "$0 ✓" : formatMoney(Math.abs(remaining))}
          </p>
        </div>
      </div>

      <Expandable collapsedHeight={480} noun={tr("payments")} className="mt-5">
        <ul className="space-y-3">
          {plan.installments.map((inst, i) => (
            <li key={i} className="relative grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end sm:gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-ink-muted" htmlFor={`inst-label-${i}`}>
                  {tr("Payment")}</label>
                <input
                  id={`inst-label-${i}`}
                  className="field-input mt-1 py-2"
                  value={customLabels.has(inst.label) ? inst.label : text(inst.label)}
                  maxLength={60}
                  onChange={(e) => { const value = e.target.value; setCustomLabels(labels => new Set([...Array.from(labels), value])); updateInstallment(i, { label: value }); }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted" htmlFor={`inst-amount-${i}`}>
                  {tr("Amount")}</label>
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
                  {tr("Date")}</label>
                <input
                  id={`inst-date-${i}`}
                  type="date"
                  className="field-input mt-1 py-2"
                  value={inst.dueDate}
                  onChange={(e) => e.target.value && updateInstallment(i, { dueDate: e.target.value })}
                />
              </div>
              {/* On phones the delete button sits in the row's top-right corner instead of taking its own line. */}
              <button
                type="button"
                onClick={() => removeInstallment(i)}
                className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100 hover:text-coral-600 sm:static sm:h-11 sm:w-11 sm:self-end"
                aria-label={tr("Remove {0}", { 0: customLabels.has(inst.label) ? inst.label : text(inst.label) })}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </Expandable>
      <Button variant="outline" size="sm" className="mt-3" onClick={addInstallment} disabled={plan.installments.length >= 12}>
        <Plus className="h-4 w-4" aria-hidden /> {tr(" Add payment")}</Button>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-sm font-semibold">{tr("Draft a message to your landlord")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="tenant-name" className="field-label">
              {tr("Your name (optional)")}</label>
            <input id="tenant-name" className="field-input" value={tenantName} maxLength={80} onChange={(e) => setTenantName(e.target.value)} />
          </div>
          <div>
            <span className="field-label">{tr("Tone")}</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={tr("Tone")}>
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
                  {t === "professional" ? tr("Professional") : tr("Warm & respectful")}
                </button>
              ))}
            </div>
          </div>
        </div>
        {!balanced && <p className="mt-3 text-sm text-amber-800">{tr("Adjust the payments so they add up to ")}{formatMoney(plan.totalOwed)} {tr(" before drafting.")}</p>}
        <Button className="mt-4 w-full sm:w-auto" onClick={draftOffline} disabled={!canDraft || drafting}>
          {tr("Use free message template")}
        </Button>
        <label className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" />
          {tr("Optional AI: I agree to send these plan details to Anthropic to draft a message. This requires authorized access; the site operator pays API charges.")}
        </label>
        <Button variant="outline" className="mt-3 w-full sm:w-auto" onClick={draft} disabled={!canDraft || drafting || !consent}>
          {drafting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MessageSquareText className="h-4 w-4" aria-hidden />}
          {drafting ? tr("Drafting your message…") : plan.proposalText ? tr("Redraft with AI") : tr("Draft with AI")}
        </Button>
        <p className="mt-2 text-xs text-ink-muted">{tr("Switching language does not rewrite your message. Generate a new template or draft when you are ready; review it before sending.")}</p>
        {draftError && (
          <p className="mt-3 rounded-xl bg-coral-50 p-3 text-sm text-coral-700" role="alert">
            {text(draftError)}
          </p>
        )}
        {plan.proposalText !== undefined ? (
          <DraftedMessage subject={subject} message={plan.proposalText} onChange={(m) => setPlan((p) => ({ ...p, proposalText: m }))} />
        ) : (
          <p className="mt-3 text-xs text-ink-muted">{text(DRAFT_DISCLAIMER)}</p>
        )}
      </div>
    </Card>
  );
}
