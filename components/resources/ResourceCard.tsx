import clsx from "clsx";
import { ExternalLink, Phone, Sparkles } from "lucide-react";
import type { ResourceMatch, ResourceStatus } from "@/types";
import { CATEGORY_LABELS } from "@/lib/engine/resourceMatcher";
import { formatDate } from "@/lib/format";
import { MAY_QUALIFY } from "@/lib/copy";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

export const STATUS_BADGE: Record<ResourceStatus, { tone: BadgeTone; label: string }> = {
  OPEN: { tone: "green", label: "Open" },
  WAITLIST: { tone: "amber", label: "Waitlist" },
  FUNDS_LIMITED: { tone: "amber", label: "Funds limited" },
  UNKNOWN: { tone: "gray", label: "Status unknown" },
  CLOSED: { tone: "coral", label: "Closed" },
};

export function ResourceCard({ match, compact = false }: { match: ResourceMatch; compact?: boolean }) {
  const r = match.resource;
  const status = STATUS_BADGE[r.status];
  const closed = r.status === "CLOSED";

  return (
    <article className={clsx("flex h-full flex-col rounded-2xl border bg-white p-5 shadow-soft", closed ? "border-slate-200 opacity-70" : "border-slate-200")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="blue">{CATEGORY_LABELS[r.category]}</Badge>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">{r.name}</h3>
      <p className="mt-1.5 text-base text-ink-soft">{r.eligibilitySummary}</p>

      {match.reasons.length > 0 && (
        <div className="mt-3 rounded-xl bg-brand-50/70 p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-800">
            <Sparkles className="h-4 w-4" aria-hidden /> Why this matches
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-brand-900/80">
            {match.reasons.slice(0, compact ? 2 : 4).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {!compact && (
        <>
          <p className="mt-3 text-sm text-ink-soft">
            <span className="font-semibold text-ink">How to apply: </span>
            {r.applicationMethod}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.countiesServed.map((c) => (
              <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft">
                {c}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-2">
          {r.phone && (
            <a
              href={`tel:${r.phone.replace(/[^0-9]/g, "")}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-sage-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-700"
            >
              <Phone className="h-4 w-4" aria-hidden /> {r.phone}
            </a>
          )}
          {r.website && (
            <a
              href={r.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-ink hover:border-brand-400 hover:bg-brand-50"
            >
              Website <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-muted">{MAY_QUALIFY}</p>
        <p className="mt-1 text-xs text-ink-muted">Demo listing · last reviewed {formatDate(r.lastVerified)}</p>
      </div>
    </article>
  );
}
