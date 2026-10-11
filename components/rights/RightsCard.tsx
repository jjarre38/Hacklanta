import clsx from "clsx";
import { BookOpen, ExternalLink, Star } from "lucide-react";
import type { RightsCardContent } from "@/lib/data/rightsContent";
import { formatDate } from "@/lib/format";
import { Expandable } from "@/components/ui/Expandable";

export function RightsCard({ card, highlighted }: { card: RightsCardContent; highlighted: boolean }) {
  return (
    <article
      id={card.id}
      className={clsx(
        "scroll-mt-24 rounded-2xl border bg-white p-5 shadow-soft sm:p-6",
        highlighted ? "border-brand-400 ring-2 ring-brand-200" : "border-slate-200",
      )}
    >
      {highlighted && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Star className="h-3.5 w-3.5" aria-hidden /> Relevant to your situation
        </p>
      )}
      <h2 className="text-lg font-semibold text-ink">{card.title}</h2>
      <p className="mt-1.5 text-base text-ink-soft">{card.summary}</p>
      <Expandable collapsedHeight={220}>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          {card.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        {card.terms && (
          <dl className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
            {card.terms.map((t) => (
              <div key={t.term}>
                <dt className="inline font-semibold text-ink">{t.term}: </dt>
                <dd className="inline text-ink-soft">{t.meaning}</dd>
              </div>
            ))}
          </dl>
        )}
      </Expandable>
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-ink-muted">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          <span>Sources:</span>
          {card.sources.map((s, i) => (
            <span key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:underline">
                {s.name} <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
              {i < card.sources.length - 1 && ","}
            </span>
          ))}
        </p>
        <p className="mt-1">
          {card.law && <>Georgia law: {card.law} · </>}Last reviewed {formatDate(card.lastReviewed)}
        </p>
      </div>
    </article>
  );
}
