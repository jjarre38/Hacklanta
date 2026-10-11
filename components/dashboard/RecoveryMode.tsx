"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Briefcase, Building2, Compass } from "lucide-react";
import type { HousingBarrier, Resource, ResourceCategory, UserCase } from "@/types";
import { BARRIER_LABELS, matchResources } from "@/lib/engine/resourceMatcher";
import { Card } from "@/components/ui/Card";
import { ResourceCard } from "@/components/resources/ResourceCard";

export const RECOVERY_CATEGORIES: ResourceCategory[] = [
  "AFFORDABLE_HOUSING",
  "TEMPORARY_HOUSING",
  "EMERGENCY_SHELTER",
  "SECURITY_DEPOSIT_ASSISTANCE",
  "MOVING_ASSISTANCE",
  "EMPLOYMENT_ASSISTANCE",
  "WORKFORCE_DEVELOPMENT",
  "PUBLIC_BENEFITS",
  "FOOD_ASSISTANCE",
  "CHILDCARE_FAMILY",
];

interface RecoveryModeProps {
  userCase: UserCase;
  resources: Resource[];
  onBarrierChange: (b: HousingBarrier) => void;
}

export function RecoveryMode({ userCase, resources, onBarrierChange }: RecoveryModeProps) {
  const { text, tr } = useI18n();
  const matches = matchResources(resources, userCase, { categories: RECOVERY_CATEGORIES, limit: 6 });

  return (
    <section className="animate-fade-up space-y-6" aria-labelledby="recovery-heading">
      <Card className="border-dusk-200 bg-gradient-to-br from-dusk-50 to-white">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dusk-100 text-dusk-700">
            <Compass className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 id="recovery-heading" className="text-xl font-bold text-ink">
              {tr("This isn't a dead end — it's a new plan.")}</h2>
            <p className="mt-1 text-ink-soft">
              {tr("Staying may not be possible, but you still have real options. We've shifted your plan toward a safe move, a stable next home, and rebuilding income — with local programs that help with each step.")}</p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="text-base font-semibold text-ink">{tr("What is making housing hardest right now?")}</legend>
          <p className="text-sm text-ink-muted">{tr("Your answer reorders your plan and resources.")}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(BARRIER_LABELS) as HousingBarrier[]).map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={userCase.housingBarrier === b}
                onClick={() => onBarrierChange(b)}
                className={clsx(
                  "min-h-[48px] rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors",
                  userCase.housingBarrier === b
                    ? "border-dusk-500 bg-dusk-100 text-dusk-700 ring-1 ring-dusk-500"
                    : "border-slate-300 bg-white text-ink hover:border-dusk-300",
                )}
              >
                {text(BARRIER_LABELS[b])}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/housing" className="group flex items-center gap-3 rounded-xl border border-dusk-200 bg-white p-4 hover:border-dusk-400">
            <Building2 className="h-6 w-6 text-dusk-600" aria-hidden />
            <span className="flex-1">
              <span className="block font-semibold">{tr("Find affordable housing")}</span>
              <span className="text-sm text-ink-muted">{tr("Search by budget, bedrooms, and area")}</span>
            </span>
            <ArrowRight className="h-5 w-5 text-dusk-600 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link href="/employment" className="group flex items-center gap-3 rounded-xl border border-dusk-200 bg-white p-4 hover:border-dusk-400">
            <Briefcase className="h-6 w-6 text-dusk-600" aria-hidden />
            <span className="flex-1">
              <span className="block font-semibold">{tr("Rebuild income")}</span>
              <span className="text-sm text-ink-muted">{tr("Job help, training, and benefits")}</span>
            </span>
            <ArrowRight className="h-5 w-5 text-dusk-600 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-semibold">{tr("Recovery resources for you")}</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((m) => (
            <ResourceCard key={m.resource.id} match={m} compact />
          ))}
        </div>
        <Link href="/resources" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-dusk-700 hover:underline">
          {tr("See all resources ")}<ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
