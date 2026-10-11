"use client";

import clsx from "clsx";
import { CalendarClock, Info, MapPin, Wallet, Receipt } from "lucide-react";
import type { CaseStatus, UserCase } from "@/types";
import { classifyCase, STATUS_META } from "@/lib/engine/caseClassifier";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";

const THEMES: Record<CaseStatus, { bg: string; badge: string; accent: string }> = {
  PREVENTION: { bg: "from-brand-600 to-brand-800", badge: "bg-white/15 text-white ring-white/30", accent: "text-brand-100" },
  URGENT_INTERVENTION: { bg: "from-amber-600 to-amber-800", badge: "bg-white/15 text-white ring-white/30", accent: "text-amber-100" },
  LEGAL_HELP_RECOMMENDED: { bg: "from-coral-600 to-[#7f3a2d]", badge: "bg-white/15 text-white ring-white/30", accent: "text-coral-100" },
  TRANSITION_RECOVERY: { bg: "from-dusk-600 to-[#3d3180]", badge: "bg-white/15 text-white ring-white/30", accent: "text-dusk-100" },
};

/** `compact` is the mobile layout: tighter spacing and smaller type so the plan starts higher on the screen. */
export function StatusBanner({ userCase, justChanged, compact = false }: { userCase: UserCase; justChanged: boolean; compact?: boolean }) {
  const { reasons, assumptions } = classifyCase(userCase);
  const meta = STATUS_META[userCase.caseStatus];
  const theme = THEMES[userCase.caseStatus];
  const days = daysUntil(userCase.courtDate);

  const stats = [
    { icon: MapPin, label: "County", value: `${userCase.county} County` },
    { icon: Receipt, label: "Amount owed", value: formatMoney(userCase.amountOwed) },
    { icon: Wallet, label: "Available today", value: formatMoney(userCase.availableToday) },
    {
      icon: CalendarClock,
      label: "Court date",
      value: userCase.courtDate ? formatDate(userCase.courtDate) : "Not set",
      sub:
        days === null ? undefined : days > 0 ? `${days} day${days === 1 ? "" : "s"} away` : days === 0 ? "Today" : `${Math.abs(days)} days ago`,
    },
  ];

  return (
    <section
      key={userCase.caseStatus}
      className={clsx(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-lift transition-colors duration-700",
        compact ? "p-4" : "p-6 sm:p-8",
        theme.bg,
        justChanged && "animate-status-shift",
      )}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className={clsx("relative flex flex-col lg:flex-row lg:items-start lg:justify-between", compact ? "gap-3" : "gap-6")}>
        <div className="max-w-xl">
          <p className={clsx("text-sm font-medium", theme.accent, compact && "sr-only")}>Your case status</p>
          <div className={clsx("flex flex-wrap items-center gap-3", !compact && "mt-2")}>
            <span
              className={clsx(
                "inline-flex items-center rounded-full font-bold ring-1 ring-inset",
                compact ? "px-3 py-1 text-base" : "px-4 py-1.5 text-lg",
                theme.badge,
                justChanged && userCase.caseStatus === "TRANSITION_RECOVERY" && "animate-pulse-ring",
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className={clsx("text-white/90", compact ? "mt-2 text-sm" : "mt-3 text-base")}>{meta.description}</p>
          <details className={clsx("group text-sm text-white/85", compact ? "mt-2" : "mt-3")}>
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-medium underline-offset-2 hover:underline">
              <Info className="h-4 w-4" aria-hidden /> Why this status?
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
              {assumptions.map((a) => (
                <li key={a} className="text-white/70">
                  {a}
                </li>
              ))}
            </ul>
          </details>
        </div>
        <dl className={clsx("grid grid-cols-2 lg:min-w-[420px]", compact ? "gap-2" : "gap-3")}>
          {stats.map((s) => (
            <div key={s.label} className={clsx("rounded-xl bg-white/10 ring-1 ring-inset ring-white/15", compact ? "px-3 py-2" : "p-3")}>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-white/75">
                <s.icon className="h-3.5 w-3.5" aria-hidden /> {s.label}
              </dt>
              <dd className={clsx("font-semibold leading-tight", compact ? "mt-0.5 text-base" : "mt-1 text-lg")}>{s.value}</dd>
              {s.sub && <dd className={clsx("font-medium text-white/85", compact ? "text-xs" : "text-sm")}>{s.sub}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
