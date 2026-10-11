"use client";
import { presentCaseEvent } from "@/lib/i18n/events";


import { useI18n } from "@/lib/i18n/LocaleProvider";

import clsx from "clsx";
import { CalendarClock, CircleDot, History, Sparkles, UserRound } from "lucide-react";
import type { UserCase } from "@/types";
import { buildPaymentPlan } from "@/lib/services/paymentPlanService";
import { daysUntil, parseDate } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Expandable } from "@/components/ui/Expandable";

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  kind: "past-user" | "past-system" | "upcoming";
  highlight?: boolean;
  original?: string;
}

export function CaseTimeline({ userCase }: { userCase: UserCase }) {
  const { locale, tr, formatMoney } = useI18n();
  const now = new Date();
  const upcoming: TimelineEntry[] = [];

  if (userCase.courtDate && (daysUntil(userCase.courtDate, now) ?? -1) >= 0) {
    upcoming.push({ id: "court", date: userCase.courtDate, title: tr("Court hearing — arrive 30 minutes early"), kind: "upcoming", highlight: true });
  }
  if (userCase.nextPaycheckDate && (daysUntil(userCase.nextPaycheckDate, now) ?? -1) >= 0) {
    upcoming.push({
      id: "payday",
      date: userCase.nextPaycheckDate,
      title: tr("Next paycheck{0}", { 0: userCase.nextPaycheckAmount ? ` (${formatMoney(userCase.nextPaycheckAmount)})` : "" }),
      kind: "upcoming",
    });
  }
  if (userCase.caseStatus !== "TRANSITION_RECOVERY" && userCase.amountOwed > 0) {
    for (const inst of buildPaymentPlan(userCase, now).installments.slice(1, 4)) {
      upcoming.push({ id: `inst-${inst.dueDate}`, date: inst.dueDate, title: tr("Suggested payment: {0}", { 0: formatMoney(inst.amount) }), kind: "upcoming" });
    }
  }
  upcoming.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  const past: TimelineEntry[] = [...userCase.events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((e) => ({
      id: e.id,
      date: e.date,
      ...presentCaseEvent(e, locale),
      kind: e.isUserAction ? "past-user" : "past-system",
      highlight: e.type === "STATUS_CHANGED",
    }));

  return (
    <Card>
      <CardHeader icon={<History className="h-5 w-5" />} title={tr("Timeline")} description={tr("Upcoming deadlines and what's happened so far.")} />
      <Expandable collapsedHeight={360} noun={tr("events")}>
        {upcoming.length > 0 && (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">{tr("Coming up")}</p>
            <Timeline entries={upcoming} />
          </>
        )}
        <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-ink-muted">{tr("History")}</p>
        <Timeline entries={past} />
      </Expandable>
    </Card>
  );
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { tr, formatDate } = useI18n();
  return (
    <ol className="relative ml-3 border-l-2 border-slate-200">
      {entries.map((e) => {
        const Icon = e.kind === "upcoming" ? CalendarClock : e.kind === "past-user" ? UserRound : e.highlight ? Sparkles : CircleDot;
        return (
          <li key={e.id} className="relative mb-4 pl-6 last:mb-0">
            <span
              className={clsx(
                "absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white",
                e.kind === "upcoming"
                  ? e.highlight
                    ? "bg-coral-500 text-white"
                    : "bg-brand-100 text-brand-700"
                  : e.highlight
                    ? "bg-dusk-500 text-white"
                    : "bg-slate-100 text-slate-500",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className={clsx("text-sm font-medium", e.highlight ? "text-ink" : "text-ink-soft")}>{e.title}</p>
            {e.original && <details className="mt-1 text-xs text-ink-muted"><summary>{tr("Original recorded details (unchanged)")}</summary><p className="mt-1 whitespace-pre-wrap">{e.original}</p></details>}
            <p className="text-xs text-ink-muted">
              {formatDate(e.date, { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
