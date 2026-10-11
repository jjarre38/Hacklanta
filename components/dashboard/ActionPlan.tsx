"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, ListChecks } from "lucide-react";
import type { ActionItem, ActionUrgency } from "@/types";
import { URGENCY_LABELS } from "@/lib/services/recommendationService";
import { useIsMobile } from "@/lib/client/useIsMobile";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Expandable } from "@/components/ui/Expandable";

const URGENCY_DOT: Record<ActionUrgency, string> = {
  TODAY: "bg-coral-500",
  BEFORE_COURT: "bg-amber-500",
  THIS_WEEK: "bg-brand-500",
  ONGOING: "bg-sage-500",
};

interface ActionPlanProps {
  items: ActionItem[];
  onToggle: (id: string) => void;
  recovery?: boolean;
}

export function ActionPlan({ items, onToggle, recovery }: ActionPlanProps) {
  const { text, tr } = useI18n();
  const isMobile = useIsMobile();
  const done = items.filter((i) => i.completed).length;
  const groups = (Object.keys(URGENCY_LABELS) as ActionUrgency[])
    .map((u) => ({ urgency: u, items: items.filter((i) => i.urgency === u) }))
    .filter((g) => g.items.length > 0);
  const [activeGroup, setActiveGroup] = useState<ActionUrgency | null>(null);
  // Default to the first timeframe; fall back to it if the selected one no longer has steps.
  const currentGroup = groups.find((g) => g.urgency === activeGroup) ?? groups[0];

  /** One timeframe's steps. In a tab the tab already names the timeframe, so only the subtitle is shown. */
  const renderGroup = (g: (typeof groups)[number], inTab: boolean) => (
    <section key={g.urgency} aria-labelledby={inTab ? `urgency-tab-${g.urgency}` : `urgency-${g.urgency}`}>
      {inTab ? (
        <p className="mb-3 text-sm text-ink-muted">{text(URGENCY_LABELS[g.urgency].subtitle)}</p>
      ) : (
        <div className="mb-3 flex items-center gap-2">
          <span className={clsx("h-2.5 w-2.5 rounded-full", URGENCY_DOT[g.urgency])} aria-hidden />
          <h3 id={`urgency-${g.urgency}`} className="text-sm font-bold uppercase tracking-wide text-ink">
            {text(URGENCY_LABELS[g.urgency].title)}
          </h3>
          {!isMobile && <span className="text-sm text-ink-muted">· {text(URGENCY_LABELS[g.urgency].subtitle)}</span>}
        </div>
      )}
      <ul className={isMobile ? "space-y-2" : "space-y-3"}>
        {g.items.map((item) => (
          <li
            key={item.id}
            className={clsx(
              "animate-fade-up rounded-xl border transition-colors",
              isMobile ? "p-3" : "p-4",
              item.completed ? "border-sage-200 bg-sage-50/60" : "border-slate-200 bg-white",
            )}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={item.completed}
                aria-label={tr("Mark \"{0}\" as {1}", { 0: item.title, 1: item.completed ? tr("not done") : tr("done") })}
                onClick={() => onToggle(item.id)}
                className={clsx(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                  item.completed ? "border-sage-600 bg-sage-600 text-white" : "border-slate-300 hover:border-brand-500",
                )}
              >
                {item.completed && <Check className="h-4 w-4" aria-hidden />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={clsx("font-semibold", item.completed && "text-ink-muted line-through")}>{item.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
                {isMobile ? (
                  // On phones the reason is tap-to-reveal and shares a row with the link, so the list stays scannable.
                  <details className="group mt-1.5 text-sm text-ink-soft">
                    <summary className="flex cursor-pointer list-none items-center gap-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-ink-muted">
                        {tr("Why this step ")}<ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden />
                      </span>
                      {item.href && (
                        <Link href={item.href} className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                          {tr("Go to step ")}<ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      )}
                    </summary>
                    <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2">{item.reason}</p>
                  </details>
                ) : (
                  <>
                    <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-ink-soft">
                      <span className="font-semibold text-ink">{tr("Why: ")}</span>
                      {item.reason}
                    </p>
                    {item.href && (
                      <Link href={item.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                        {tr("Go to this step ")}<ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <Card>
      <CardHeader
        icon={<ListChecks className="h-5 w-5" />}
        title={recovery ? tr("Your recovery plan") : tr("Your action plan")}
        description={tr("Each step explains why it's on your list. Check things off as you go.")}
      />
      <ProgressBar value={done} max={items.length} label={tr("{0} of {1} steps done", { 0: done, 1: items.length })} tone={recovery ? "violet" : "green"} className={isMobile ? "mb-4" : "mb-6"} />

      {recovery && currentGroup ? (
        <>
          {/* Recovery plans are split into tabs by timeframe so each step list stays short. */}
          <div role="tablist" aria-label={tr("Steps by timeframe")} className="flex flex-wrap gap-1.5">
            {groups.map((g) => {
              const left = g.items.filter((i) => !i.completed).length;
              const selected = g.urgency === currentGroup.urgency;
              return (
                <button
                  key={g.urgency}
                  type="button"
                  role="tab"
                  id={`urgency-tab-${g.urgency}`}
                  aria-selected={selected}
                  aria-controls={`urgency-panel-${g.urgency}`}
                  onClick={() => setActiveGroup(g.urgency)}
                  className={clsx(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                    selected ? "border-dusk-300 bg-dusk-50 text-dusk-700" : "border-slate-200 bg-white text-ink-muted hover:text-ink",
                  )}
                >
                  <span className={clsx("h-2 w-2 rounded-full", URGENCY_DOT[g.urgency])} aria-hidden />
                  {text(URGENCY_LABELS[g.urgency].title)}
                  <span
                    className={clsx(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      left === 0 ? "bg-sage-100 text-sage-700" : selected ? "bg-white text-dusk-700" : "bg-slate-100 text-ink-muted",
                    )}
                    aria-label={left === 0 ? tr("all done") : tr("{0} to do", { 0: left })}
                  >
                    {left === 0 ? "✓" : left}
                  </span>
                </button>
              );
            })}
          </div>
          <div role="tabpanel" id={`urgency-panel-${currentGroup.urgency}`} aria-labelledby={`urgency-tab-${currentGroup.urgency}`} className="mt-4">
            <Expandable key={currentGroup.urgency} collapsedHeight={isMobile ? 640 : 760} noun={tr("steps")}>
              {renderGroup(currentGroup, true)}
            </Expandable>
          </div>
        </>
      ) : (
        <Expandable collapsedHeight={isMobile ? 640 : 760} noun={tr("steps")}>
          <div className={isMobile ? "space-y-5" : "space-y-7"}>{groups.map((g) => renderGroup(g, false))}</div>
        </Expandable>
      )}
    </Card>
  );
}
