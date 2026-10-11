"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import clsx from "clsx";
import type { ReactNode } from "react";

export type BadgeTone = "blue" | "green" | "amber" | "coral" | "violet" | "gray";

const tones: Record<BadgeTone, string> = {
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  green: "bg-sage-50 text-sage-700 ring-sage-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  coral: "bg-coral-50 text-coral-700 ring-coral-200",
  violet: "bg-dusk-50 text-dusk-700 ring-dusk-200",
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function Badge({ tone = "gray", children, className, icon }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Small label used on every simulated value in the app. */
export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  const { text } = useI18n();
  return (
    <Badge tone="amber" className={className}>
      {text(label)}
    </Badge>
  );
}
