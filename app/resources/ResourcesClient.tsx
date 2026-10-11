"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info, SearchX } from "lucide-react";
import type { ResourceCategory } from "@/types";
import { useCase } from "@/lib/client/caseStore";
import { useResources } from "@/lib/client/useResources";
import { CATEGORY_LABELS, matchResources } from "@/lib/engine/resourceMatcher";
import { calculateFinancialGap } from "@/lib/engine/resourceCombinationEngine";
import { STATUS_META } from "@/lib/engine/caseClassifier";
import { MAY_QUALIFY } from "@/lib/copy";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceFilters, type ResourceFilterState } from "@/components/resources/ResourceFilters";
import { ResourceCombinationPanel } from "@/components/resources/ResourceCombinationPanel";
import { DemoBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export function ResourcesClient() {
  const params = useSearchParams();
  const { userCase, loaded } = useCase();
  const { resources } = useResources();
  const initialCategory = params.get("category");
  const [filters, setFilters] = useState<ResourceFilterState>({
    category: initialCategory && initialCategory in CATEGORY_LABELS ? (initialCategory as ResourceCategory) : "",
    county: "",
    openOnly: false,
  });
  const [useMyCase, setUseMyCase] = useState(true);

  // Default the county filter to the user's county once the case loads.
  useEffect(() => {
    if (userCase) setFilters((f) => (f.county ? f : { ...f, county: userCase.county }));
  }, [userCase]);

  const personalize = Boolean(userCase && useMyCase);
  const matches = matchResources(resources, personalize ? userCase : null, {
    county: filters.county || undefined,
    categories: filters.category ? [filters.category] : undefined,
    openOnly: filters.openOnly,
  });

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Metro Atlanta resources</h1>
        <DemoBadge />
      </div>
      <p className="mt-1 max-w-2xl text-ink-soft">
        {personalize
          ? `Ranked for your situation (${STATUS_META[userCase!.caseStatus].label}). Programs that serve your county and fit your stage come first.`
          : "Browse legal aid, rental and utility help, shelter, housing, jobs, and family support. Build a plan to get personalized matches."}
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 sm:text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          This is a demo dataset. Availability statuses are simulated and contact details may have changed — always confirm with the organization. {MAY_QUALIFY}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <ResourceFilters value={filters} onChange={setFilters} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-ink-muted" aria-live="polite">
              {matches.length} resource{matches.length === 1 ? "" : "s"}
            </p>
            {userCase && (
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded" checked={useMyCase} onChange={(e) => setUseMyCase(e.target.checked)} />
                Rank using my case
              </label>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <SearchX className="mx-auto h-8 w-8 text-ink-muted" aria-hidden />
              <p className="mt-2 font-semibold">No exact matches for these filters</p>
              <p className="mt-1 text-sm text-ink-muted">
                Try turning off &ldquo;Open now only&rdquo; or choosing all types. You can also call{" "}
                <a href="tel:211" className="font-semibold text-brand-700 underline">
                  2-1-1
                </a>{" "}
                any time for programs that opened recently.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {matches.map((m) => (
                <ResourceCard key={m.resource.id} match={m} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {loaded && userCase ? (
            <div className="lg:sticky lg:top-24">
              <ResourceCombinationPanel gap={calculateFinancialGap(userCase, resources)} />
            </div>
          ) : (
            loaded && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                <p className="font-semibold text-brand-900">Want matches made for you?</p>
                <p className="mt-1 text-sm text-brand-900/80">
                  Answer a few questions and we&apos;ll rank these programs for your situation and show how they could close your rent gap.
                </p>
                <ButtonLink href="/intake" className="mt-4 w-full">
                  Build My Action Plan
                </ButtonLink>
              </div>
            )
          )}
        </aside>
      </div>
    </div>
  );
}
