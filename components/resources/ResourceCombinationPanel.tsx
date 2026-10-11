"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { Layers } from "lucide-react";
import type { FinancialGap } from "@/types";

import { Card, CardHeader } from "@/components/ui/Card";
import { DemoBadge } from "@/components/ui/Badge";

const SOURCE_COLORS = ["bg-violet-400", "bg-purple-400", "bg-violet-500", "bg-fuchsia-400", "bg-purple-700"];

/** Stacked bar showing how funds + programs could combine to cover the need. */
export function GapBar({ gap }: { gap: FinancialGap }) {
  const { tr, formatMoney } = useI18n();
  const total = Math.max(1, gap.amountOwed);
  const segments = [
    { label: tr("Available today"), amount: Math.min(gap.availableToday, total), color: "bg-violet-700" },
    { label: tr("Next paycheck"), amount: Math.min(gap.nextPaycheckContribution, Math.max(0, total - gap.availableToday)), color: "bg-violet-300" },
    ...gap.sources.map((s, i) => ({ label: s.name, amount: s.estimatedAmount, color: SOURCE_COLORS[i % SOURCE_COLORS.length], striped: true })),
  ].filter((s) => s.amount > 0);

  return (
    <div>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-200" role="img" aria-label={tr("How the gap could be covered")}>
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.color} h-full transition-all duration-700 ${"striped" in s ? "bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(255,255,255,.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.25)_50%,rgba(255,255,255,.25)_75%,transparent_75%)]" : ""}`}
            style={{ width: `${(s.amount / total) * 100}%` }}
            title={`${s.label}: ${formatMoney(s.amount)}`}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className={`h-3 w-3 shrink-0 rounded-sm ${s.color}`} aria-hidden />
              <span className="truncate text-ink-soft">{s.label}</span>
            </span>
            <span className="font-semibold tabular-nums">{formatMoney(s.amount)}</span>
          </li>
        ))}
        {gap.remainingGap > 0 && (
          <li className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-slate-200" aria-hidden />
              <span className="text-ink-soft">{tr("Still uncovered")}</span>
            </span>
            <span className="font-semibold tabular-nums text-coral-600">{formatMoney(gap.remainingGap)}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

export function ResourceCombinationPanel({ gap }: { gap: FinancialGap }) {
  const { text, tr, formatMoney } = useI18n();
  const isMove = gap.mode === "MOVE";
  return (
    <Card className="border-violet-200 bg-violet-50/30">
      <CardHeader
        icon={<Layers className="h-5 w-5 text-violet-700" />}
        title={isMove ? tr("Covering move-in costs") : tr("Closing your rent gap")}
        description={isMove ? tr("How your funds and programs could combine for a new place.") : tr("How your funds and assistance programs could combine.")}
        action={<DemoBadge label={tr("Estimates")} />}
      />
      <div className="mb-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-violet-50 p-3">
          <p className="text-xs text-ink-muted">{isMove ? tr("Estimated need") : tr("Owed")}</p>
          <p className="text-lg font-bold tabular-nums">{formatMoney(gap.amountOwed)}</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-3">
          <p className="text-xs text-ink-muted">{tr("Gap before help")}</p>
          <p className="text-lg font-bold tabular-nums">{formatMoney(gap.gapBeforeAssistance)}</p>
        </div>
        <div className={`rounded-xl p-3 ${gap.remainingGap === 0 ? "bg-violet-100" : "bg-amber-50"}`}>
          <p className="text-xs text-ink-muted">{tr("After programs")}</p>
          <p className={`text-lg font-bold tabular-nums ${gap.remainingGap === 0 ? "text-violet-800" : "text-amber-800"}`}>
            {gap.remainingGap === 0 ? tr("Covered") : formatMoney(gap.remainingGap)}
          </p>
        </div>
      </div>
      <GapBar gap={gap} />
      <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-ink-muted">
        <li>{tr("Program amounts are demo estimates, not promises. Each program decides separately, and you may qualify for more or less.")}</li>
        {gap.assumptions.map((a) => (
          <li key={a}>{text(a)}</li>
        ))}
      </ul>
    </Card>
  );
}
