"use client";

import { useCase } from "@/lib/client/account";
import { useI18n } from "@/lib/i18n/LocaleProvider";

import { Briefcase, Compass } from "lucide-react";
import type { ResourceCategory, UserCase } from "@/types";
import { useResources } from "@/lib/client/useResources";
import { CATEGORY_LABELS, matchResources } from "@/lib/engine/resourceMatcher";
import { Card, CardHeader } from "@/components/ui/Card";
import { DemoBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ResourceCard } from "@/components/resources/ResourceCard";

/** Situation-based next steps for rebuilding income. Deterministic. */
function employmentSteps(c: UserCase | null): { title: string; reason: string }[] {
  if (!c) {
    return [
      { title: "Visit a free career center", reason: "Goodwill and WorkSource centers offer job search help and paid training at no cost." },
      { title: "Check benefits while you search", reason: "SNAP and Medicaid can cover basics so your paycheck goes further." },
    ];
  }
  const steps: { title: string; reason: string }[] = [];
  if (c.employmentStatus === "UNEMPLOYED") {
    steps.push({ title: "File for unemployment with the Georgia DOL", reason: "You're not working right now. Benefits start from when you apply, so apply soon." });
  }
  if (c.incomeRecentlyReduced) {
    steps.push({
      title: "Ask about more hours or a second job",
      reason: "Your income recently dropped. Hiring events at career centers can connect you with employers hiring now.",
    });
  }
  if (c.employmentStatus === "EMPLOYED_PART_TIME" || c.employmentStatus === "SELF_EMPLOYED") {
    steps.push({ title: "Look into short-term paid training", reason: "WIOA scholarships through WorkSource can fund training for higher-paying, steadier work." });
  }
  if (c.hasChildren) {
    steps.push({ title: "Apply for CAPS childcare help", reason: "You have children. Childcare support can make it possible to work more hours or attend training." });
  }
  steps.push({ title: "Update benefits with any income change", reason: "Reporting changes keeps SNAP and Medicaid accurate and avoids gaps." });
  return steps;
}

export function EmploymentClient() {
  const { text, tr } = useI18n();
  const { userCase } = useCase();
  const { resources } = useResources();
  const categories: ResourceCategory[] = ["EMPLOYMENT_ASSISTANCE", "WORKFORCE_DEVELOPMENT", "PUBLIC_BENEFITS", ...(userCase?.hasChildren ? (["CHILDCARE_FAMILY"] as ResourceCategory[]) : [])];
  const matches = matchResources(resources, userCase, { categories, statusOverride: "TRANSITION_RECOVERY" });
  const steps = employmentSteps(userCase);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tr("Rebuild your income")}</h1>
        <DemoBadge />
      </div>
      <p className="mt-1 max-w-2xl text-ink-soft">
        {tr("Steady income is the foundation of a stable home. These free programs help with job search, training, and the benefits that bridge the gap.")}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card>
            <CardHeader icon={<Compass className="h-5 w-5" />} title={userCase ? tr("Next steps for you") : tr("Where to start")} />
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{text(s.title)}</p>
                    <p className="text-sm text-ink-muted">{text(s.reason)}</p>
                  </div>
                </li>
              ))}
            </ol>
            {!userCase && (
              <ButtonLink href="/intake" variant="outline" className="mt-5 w-full">
                {tr("Personalize these steps")}</ButtonLink>
            )}
          </Card>
        </aside>
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="h-5 w-5 text-brand-600" aria-hidden /> {tr(" Programs ")}{userCase ? tr("in {0} County", { 0: userCase.county }) : tr("in Metro Atlanta")}
          </h2>
          <p className="mb-4 text-sm text-ink-muted">{tr("Including ")}{categories.map((c) => text(CATEGORY_LABELS[c]).toLocaleLowerCase()).join(", ")}.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((m) => (
              <ResourceCard key={m.resource.id} match={m} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
