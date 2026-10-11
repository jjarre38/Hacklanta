"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import clsx from "clsx";
import { ChevronDown, ExternalLink, Phone, Sparkles } from "lucide-react";
import type { ResourceMatch, ResourceStatus } from "@/types";
import { CATEGORY_LABELS } from "@/lib/engine/resourceMatcher";

import { MAY_QUALIFY } from "@/lib/copy";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { useIsMobile } from "@/lib/client/useIsMobile";

export const STATUS_BADGE: Record<ResourceStatus, { tone: BadgeTone; label: string }> = {
  OPEN: { tone: "green", label: "Open" },
  WAITLIST: { tone: "amber", label: "Waitlist" },
  FUNDS_LIMITED: { tone: "amber", label: "Funds limited" },
  UNKNOWN: { tone: "gray", label: "Status unknown" },
  CLOSED: { tone: "coral", label: "Closed" },
};

export function ResourceCard({ match, compact = false }: { match: ResourceMatch; compact?: boolean }) {
  const { text, tr, formatDate } = useI18n();
  const r = match.resource;
  const status = STATUS_BADGE[r.status];
  const closed = r.status === "CLOSED";
  const isMobile = useIsMobile();
  const reasons = match.reasons.slice(0, compact ? 2 : 4);

  return (
    <article className={clsx("flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-soft", isMobile ? "p-4" : "p-5", closed && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="blue">{text(CATEGORY_LABELS[r.category])}</Badge>
        <Badge tone={status.tone}>{text(status.label)}</Badge>
      </div>
      <h3 className={clsx("font-semibold leading-snug text-ink", isMobile ? "mt-2 text-base" : "mt-3 text-lg")}>{r.name}</h3>
      <p className={clsx("text-ink-soft", isMobile ? "mt-1 text-sm" : "mt-1.5 text-base")}>{text(r.eligibilitySummary)}</p>

      {reasons.length > 0 &&
        (isMobile ? (
          // Collapsed on phones; the reasons are useful but long.
          <details className="group mt-2 rounded-xl bg-brand-50/70 px-3 py-2">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-brand-800">
              <Sparkles className="h-4 w-4" aria-hidden /> {tr(" Why this matches")}<ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-brand-900/80">
              {reasons.map((reason) => (
                <li key={reason}>{text(reason)}</li>
              ))}
            </ul>
          </details>
        ) : (
          <div className="mt-3 rounded-xl bg-brand-50/70 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-800">
              <Sparkles className="h-4 w-4" aria-hidden /> {tr(" Why this matches")}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-brand-900/80">
              {reasons.map((reason) => (
                <li key={reason}>{text(reason)}</li>
              ))}
            </ul>
          </div>
        ))}

      {!compact && (
        <>
          <p className="mt-3 text-sm text-ink-soft">
            <span className="font-semibold text-ink">{tr("How to apply: ")}</span>
            {text(r.applicationMethod)}
          </p>
          {!isMobile && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.countiesServed.map((c) => (
                <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft">
                  {c}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <div className={clsx("mt-auto", isMobile ? "pt-3" : "pt-4")}>
        <div className="flex flex-wrap gap-2">
          {r.phone && (
            <a
              href={`tel:${r.phone.replace(/[^0-9]/g, "")}`}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-sage-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-700 sm:flex-none"
            >
              <Phone className="h-4 w-4" aria-hidden /> {r.phone}
            </a>
          )}
          {r.website && (
            <a
              href={r.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-ink hover:border-brand-400 hover:bg-brand-50 sm:flex-none"
            >
              {tr("Website ")}<ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
        {isMobile ? (
          <p className="mt-2 text-xs text-ink-muted">{tr("Confirm eligibility with the organization · reviewed ")}{formatDate(r.lastVerified)}</p>
        ) : (
          <>
            <p className="mt-3 text-xs text-ink-muted">{text(MAY_QUALIFY)}</p>
            <p className="mt-1 text-xs text-ink-muted">{tr("Demo listing · last reviewed ")}{formatDate(r.lastVerified)}</p>
          </>
        )}
      </div>
    </article>
  );
}
