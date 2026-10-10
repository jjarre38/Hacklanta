"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowRight, Check, ListChecks } from "lucide-react";
import type { ActionItem, ActionUrgency } from "@/types";
import { URGENCY_LABELS } from "@/lib/services/recommendationService";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
  const done = items.filter((i) => i.completed).length;
  const groups = (Object.keys(URGENCY_LABELS) as ActionUrgency[])
    .map((u) => ({ urgency: u, items: items.filter((i) => i.urgency === u) }))
    .filter((g) => g.items.length > 0);

  return (
    <Card>
      <CardHeader
        icon={<ListChecks className="h-5 w-5" />}
        title={recovery ? "Your recovery plan" : "Your action plan"}
        description="Each step explains why it's on your list. Check things off as you go."
      />
      <ProgressBar value={done} max={items.length} label={`${done} of ${items.length} steps done`} tone={recovery ? "violet" : "green"} className="mb-6" />

      <div className="space-y-7">
        {groups.map((g) => (
          <section key={g.urgency} aria-labelledby={`urgency-${g.urgency}`}>
            <div className="mb-3 flex items-center gap-2">
              <span className={clsx("h-2.5 w-2.5 rounded-full", URGENCY_DOT[g.urgency])} aria-hidden />
              <h3 id={`urgency-${g.urgency}`} className="text-sm font-bold uppercase tracking-wide text-ink">
                {URGENCY_LABELS[g.urgency].title}
              </h3>
              <span className="text-sm text-ink-muted">· {URGENCY_LABELS[g.urgency].subtitle}</span>
            </div>
            <ul className="space-y-3">
              {g.items.map((item) => (
                <li
                  key={item.id}
                  className={clsx(
                    "animate-fade-up rounded-xl border p-4 transition-colors",
                    item.completed ? "border-sage-200 bg-sage-50/60" : "border-slate-200 bg-white",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.completed}
                      aria-label={`Mark "${item.title}" as ${item.completed ? "not done" : "done"}`}
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
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-ink-soft">
                        <span className="font-semibold text-ink">Why: </span>
                        {item.reason}
                      </p>
                      {item.href && (
                        <Link href={item.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                          Go to this step <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Card>
  );
}
