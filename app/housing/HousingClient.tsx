"use client";

import { useCase } from "@/lib/client/account";
import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useEffect, useState } from "react";
import { Building2, Lightbulb } from "lucide-react";
import type { ResourceMatch } from "@/types";
import { useResources } from "@/lib/client/useResources";
import { BARRIER_LABELS, CATEGORY_LABELS, matchResources } from "@/lib/engine/resourceMatcher";
import { housingGuidance, type HousingPreferences } from "@/lib/engine/housingGuidance";
import { SERVICE_COUNTIES } from "@/lib/data/serviceArea";
import { Card, CardHeader } from "@/components/ui/Card";
import { DemoBadge } from "@/components/ui/Badge";
import { ResourceCard } from "@/components/resources/ResourceCard";

export function HousingClient() {
  const { locale, text, tr } = useI18n();
  const { userCase } = useCase();
  const { resources } = useResources();
  const [prefs, setPrefs] = useState<HousingPreferences>({ maxRent: 1100, bedrooms: 2, county: "", moveInDate: "", needsTransit: false });

  useEffect(() => {
    if (!userCase) return;
    setPrefs((p) => ({
      ...p,
      county: p.county || userCase.county,
      maxRent: userCase.monthlyRent || p.maxRent,
      bedrooms: userCase.householdSize >= 4 ? 3 : userCase.householdSize >= 2 ? 2 : 1,
    }));
  }, [userCase]);

  const guidance = housingGuidance(prefs, userCase, new Date(), locale);
  // Recovery status gives housing categories top relevance; the barrier answer boosts its category.
  const ranked = matchResources(resources, userCase, {
    county: prefs.county || undefined,
    categories: guidance.categories,
    statusOverride: "TRANSITION_RECOVERY",
  });
  // Each resource appears once, under its primary category if shown, otherwise its first matching secondary one.
  const groupOf = (m: ResourceMatch) =>
    guidance.categories.includes(m.resource.category)
      ? m.resource.category
      : guidance.categories.find((c) => m.resource.secondaryCategories?.includes(c));
  const groups = guidance.categories
    .map((cat) => ({ cat, items: ranked.filter((m) => groupOf(m) === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tr("Find your next home")}</h1>
        <DemoBadge />
      </div>
      <p className="mt-1 max-w-2xl text-ink-soft">
        {tr("Tell us what you need and we'll point you to affordable housing programs, deposit help, and temporary options in Metro Atlanta.")}</p>
      {userCase?.housingBarrier && (
        <p className="mt-3 inline-flex rounded-full bg-dusk-50 px-3 py-1 text-sm font-medium text-dusk-700">
          {tr("Prioritized for: ")}{text(BARRIER_LABELS[userCase.housingBarrier])}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card>
            <CardHeader icon={<Building2 className="h-5 w-5" />} title={tr("What you're looking for")} />
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="maxRent" className="field-label">
                  {tr("Max monthly rent")}</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ink-muted">$</span>
                  <input
                    id="maxRent"
                    type="number"
                    min={0}
                    className="field-input pl-8"
                    value={prefs.maxRent || ""}
                    onChange={(e) => setPrefs({ ...prefs, maxRent: Math.max(0, Number(e.target.value)) })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="bedrooms" className="field-label">
                  {tr("Bedrooms")}</label>
                <select id="bedrooms" className="field-input" value={prefs.bedrooms} onChange={(e) => setPrefs({ ...prefs, bedrooms: Number(e.target.value) })}>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? tr("Studio") : n === 4 ? "4+" : n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="area" className="field-label">
                  {tr("Preferred area")}</label>
                <select id="area" className="field-input" value={prefs.county} onChange={(e) => setPrefs({ ...prefs, county: e.target.value })}>
                  <option value="">{tr("Anywhere in Metro Atlanta")}</option>
                  {SERVICE_COUNTIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} {tr(" County")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="moveIn" className="field-label">
                  {tr("Move-in date")}</label>
                <input id="moveIn" type="date" className="field-input" value={prefs.moveInDate} onChange={(e) => setPrefs({ ...prefs, moveInDate: e.target.value })} />
              </div>
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-2.5">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300"
                  checked={prefs.needsTransit}
                  onChange={(e) => setPrefs({ ...prefs, needsTransit: e.target.checked })}
                />
                <span className="text-sm font-medium">{tr("I need access to public transit")}</span>
              </label>
            </form>
          </Card>

          <Card className="bg-sage-50/60">
            <CardHeader icon={<Lightbulb className="h-5 w-5" />} title={tr("Guidance for your search")} />
            <ul className="space-y-2.5 text-sm text-ink-soft">
              {guidance.tips.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500" aria-hidden />
                  {text(t)}
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        <div className="space-y-8">
          {groups.map((g) => (
            <ResourceGroup key={g.cat} title={CATEGORY_LABELS[g.cat]} items={g.items} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceGroup({ title, items }: { title: string; items: ResourceMatch[] }) {
  const { text } = useI18n();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{text(title)}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((m) => (
          <ResourceCard key={m.resource.id} match={m} />
        ))}
      </div>
    </section>
  );
}
