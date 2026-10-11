"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, Calculator, ClipboardList, HeartHandshake, ListChecks, RefreshCw, Sparkles, Wallet, X, type LucideIcon } from "lucide-react";
import type { CaseStatus, CaseUpdate, ExtractedDocument, HousingBarrier, UserCase } from "@/types";
import { clearCase, useCase } from "@/lib/client/caseStore";
import { useResources } from "@/lib/client/useResources";
import { useIsMobile } from "@/lib/client/useIsMobile";
import { applyCaseUpdate, applyExtractedDocument, createCaseFromIntake, toggleActionCompleted } from "@/lib/services/caseService";
import { generateActionPlan } from "@/lib/services/recommendationService";
import { matchResources } from "@/lib/engine/resourceMatcher";
import { STATUS_META } from "@/lib/engine/caseClassifier";
import { mariaIntake } from "@/lib/demo/mariaSeed";
import { makeId } from "@/lib/format";
import { LEGAL_DISCLAIMER } from "@/lib/copy";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { VoicePlan } from "@/components/dashboard/VoicePlan";
import { ActionPlan } from "@/components/dashboard/ActionPlan";
import { CaseTimeline } from "@/components/dashboard/CaseTimeline";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { CaseUpdatePanel } from "@/components/dashboard/CaseUpdatePanel";
import { DemoControls } from "@/components/dashboard/DemoControls";
import { RecoveryMode } from "@/components/dashboard/RecoveryMode";
import { PaymentPlanCalculator } from "@/components/paymentplan/PaymentPlanCalculator";
import { DocumentUpload } from "@/components/document/DocumentUpload";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DashboardSkeleton } from "./DashboardSkeleton";

interface Transition {
  from: CaseStatus;
  to: CaseStatus;
}

type PlanTab = "actions" | "payment" | "matches";
/** Plan tabs plus the sidebar panels, which become their own sections on mobile. */
type Section = PlanTab | "money" | "updates";

export function DashboardClient() {
  const { userCase, loaded, update } = useCase();
  const { resources } = useResources();
  const [transition, setTransition] = useState<Transition | null>(null);
  const [justChanged, setJustChanged] = useState(false);
  const [activeTab, setActiveTab] = useState<Section>("actions");
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const latest = useRef<UserCase | null>(null);
  latest.current = userCase;

  useEffect(() => {
    if (!justChanged) return;
    const t = setTimeout(() => setJustChanged(false), 1600);
    return () => clearTimeout(t);
  }, [justChanged]);

  if (!loaded) return <DashboardSkeleton />;
  if (!userCase) return <EmptyState onLoadMaria={() => update(createCaseFromIntake(mariaIntake()))} />;

  /** Save a new version of the case and surface any status change. */
  function commit(next: UserCase) {
    const prev = latest.current;
    latest.current = next;
    update(next);
    if (prev && prev.caseStatus !== next.caseStatus) {
      setTransition({ from: prev.caseStatus, to: next.caseStatus });
      setJustChanged(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const applyUpdate = (u: CaseUpdate) => latest.current && commit(applyCaseUpdate(latest.current, u));

  function setBarrier(b: HousingBarrier) {
    const c = latest.current!;
    commit({
      ...c,
      housingBarrier: b,
      updatedAt: new Date().toISOString(),
      events: [...c.events, { id: makeId("evt"), type: "BARRIER_SET", description: "Updated what's making housing hardest", date: new Date().toISOString(), isUserAction: true }],
    });
  }

  function applyDocument(doc: ExtractedDocument) {
    commit(applyExtractedDocument(latest.current!, doc));
  }

  const recovery = userCase.caseStatus === "TRANSITION_RECOVERY";
  const actions = generateActionPlan(userCase);
  const topMatches = matchResources(resources, userCase, { limit: 4 });
  const tabs: { id: PlanTab; label: string; short: string; icon: LucideIcon }[] = [
    { id: "actions", label: recovery ? "Recovery plan" : "Action plan", short: "Plan", icon: ListChecks },
    ...(!recovery && userCase.amountOwed > 0 ? [{ id: "payment" as const, label: "Payment plan", short: "Pay", icon: Calculator }] : []),
    ...(!recovery ? [{ id: "matches" as const, label: "Best matches", short: "Matches", icon: HeartHandshake }] : []),
  ];
  // Mobile has no sidebar, so its panels become extra sections in the bottom bar.
  const sections: { id: Section; label: string; short: string; icon: LucideIcon }[] = [
    ...tabs,
    { id: "money", label: "Rent gap", short: "Money", icon: Wallet },
    { id: "updates", label: "Updates", short: "Updates", icon: RefreshCw },
  ];
  // Fall back to the action plan if the selected section disappears (e.g. after moving to recovery or resizing).
  const available = isMobile ? sections : tabs;
  const current = available.some((t) => t.id === activeTab) ? activeTab : "actions";

  const demoControls = (
    <DemoControls
      onLandlordRejected={() => applyUpdate({ type: "LANDLORD_REJECTED_PLAN", note: "Demo" })}
      onAssistanceUnavailable={() => applyUpdate({ type: "ASSISTANCE_DENIED", note: "Demo" })}
      onFullTransition={() => {
        applyUpdate({ type: "LANDLORD_REJECTED_PLAN", note: "Demo" });
        setTimeout(() => applyUpdate({ type: "ASSISTANCE_DENIED", note: "Demo" }), 900);
      }}
      onResetMaria={() => {
        setTransition(null);
        const fresh = createCaseFromIntake(mariaIntake());
        latest.current = fresh;
        update(fresh);
      }}
      onClear={() => {
        setTransition(null);
        clearCase();
      }}
    />
  );

  const actionPlan = (
    <ActionPlan
      key={userCase.caseStatus}
      items={actions}
      recovery={recovery}
      onToggle={(id) => latest.current && commit(toggleActionCompleted(latest.current, id))}
    />
  );
  const paymentPlan = (
    <PaymentPlanCalculator key={`${userCase.amountOwed}-${userCase.availableToday}-${userCase.nextPaycheckDate}`} userCase={userCase} />
  );
  const bestMatches = (
    <section aria-labelledby="top-resources">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="top-resources" className="text-lg font-semibold">
          Best matches for you
        </h2>
        <Link href="/resources" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
          All resources <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:gap-5">
        {topMatches.map((m) => (
          <ResourceCard key={m.resource.id} match={m} compact />
        ))}
      </div>
    </section>
  );
  const financialSummary = <FinancialSummary userCase={userCase} resources={resources} />;
  const caseUpdates = (
    <>
      <CaseUpdatePanel onSubmit={applyUpdate} />
      <DocumentUpload onApply={applyDocument} />
      <CaseTimeline userCase={userCase} />
    </>
  );

  if (isMobile) {
    const select = (id: Section) => {
      setActiveTab(id);
      // Bring the new section's top into view if the user had scrolled past it.
      const el = sectionRef.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
    };
    const label = sections.find((s) => s.id === current)!.label;

    return (
      <div className="container-wide py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight">Your HomePath plan</h1>
          {demoControls}
        </div>

        {transition && <TransitionNotice transition={transition} onDismiss={() => setTransition(null)} />}

        <StatusBanner userCase={userCase} justChanged={justChanged} compact />

        <div ref={sectionRef} className="mt-5 scroll-mt-20 space-y-4" role="region" aria-label={label}>
          {current === "actions" && (
            <>
              {recovery && <RecoveryMode userCase={userCase} resources={resources} onBarrierChange={setBarrier} />}
              <VoicePlan userCase={userCase} actions={actions} compact />
              {actionPlan}
            </>
          )}
          {current === "payment" && paymentPlan}
          {current === "matches" && bestMatches}
          {current === "money" && financialSummary}
          {current === "updates" && (
            <>
              {caseUpdates}
              <Link href="/intake" className="block text-center text-sm font-semibold text-brand-700 hover:underline">
                Start over with new answers
              </Link>
            </>
          )}
        </div>

        {/* The legal disclaimer lives in the footer on mobile rather than repeating it here. */}
        <nav
          data-bottom-nav
          aria-label="Plan sections"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        >
          <div className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))` }}>
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => select(s.id)}
                aria-current={current === s.id ? "page" : undefined}
                className={clsx(
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                  current === s.id ? "text-brand-700" : "text-ink-muted",
                )}
              >
                <span className={clsx("flex h-7 w-12 items-center justify-center rounded-full", current === s.id && "bg-brand-50")}>
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                {s.short}
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="container-wide py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your HomePath plan</h1>
          <p className="mt-1 text-ink-muted">Here&apos;s what you can still do next. Your plan updates as your situation changes.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/intake" className="text-sm font-semibold text-brand-700 hover:underline">
            Start over with new answers
          </Link>
          {demoControls}
        </div>
      </div>

      {transition && <TransitionNotice transition={transition} onDismiss={() => setTransition(null)} />}

      <StatusBanner userCase={userCase} justChanged={justChanged} />
      <VoicePlan userCase={userCase} actions={actions} />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-12">
        <div className="min-w-0 space-y-8">
          {recovery && <RecoveryMode userCase={userCase} resources={resources} onBarrierChange={setBarrier} />}
          <div role="tablist" aria-label="Your plan" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={current === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  current === t.id ? "bg-white text-brand-700 shadow-sm" : "text-ink-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`panel-${current}`} aria-labelledby={`tab-${current}`}>
            {current === "actions" && actionPlan}
            {current === "payment" && paymentPlan}
            {current === "matches" && bestMatches}
          </div>
        </div>

        <aside className="space-y-8">
          {financialSummary}
          {caseUpdates}
        </aside>
      </div>

      <p className="mt-12 rounded-xl bg-slate-100 p-5 text-sm text-ink-soft">{LEGAL_DISCLAIMER}</p>
    </div>
  );
}

function TransitionNotice({ transition, onDismiss }: { transition: Transition; onDismiss: () => void }) {
  const toRecovery = transition.to === "TRANSITION_RECOVERY";
  return (
    <div
      className={`animate-fade-up mb-5 flex items-start gap-3 rounded-2xl border p-4 ${toRecovery ? "border-dusk-200 bg-dusk-50" : "border-brand-200 bg-brand-50"}`}
      role="status"
    >
      <Sparkles className={`mt-0.5 h-5 w-5 shrink-0 ${toRecovery ? "text-dusk-600" : "text-brand-600"}`} aria-hidden />
      <div className="flex-1">
        <p className="font-semibold">
          Your plan changed: {STATUS_META[transition.from].label} → {STATUS_META[transition.to].label}
        </p>
        <p className="text-sm text-ink-soft">
          {toRecovery
            ? "Staying may no longer be realistic, so we've rebuilt your plan around a safe move and a stable next home. You still have options."
            : "We recalculated your status and action plan based on your update."}
        </p>
      </div>
      <button type="button" onClick={onDismiss} className="rounded-lg p-1 text-ink-muted hover:bg-white" aria-label="Dismiss">
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function EmptyState({ onLoadMaria }: { onLoadMaria: () => void }) {
  return (
    <div className="container-page py-16">
      <Card className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ClipboardList className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Let&apos;s build your plan</h1>
        <p className="mt-2 text-ink-soft">Answer a few questions (about 3 minutes) and we&apos;ll create a step-by-step plan matched to local help.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/intake" size="lg">
            Build My Action Plan <ArrowRight className="h-5 w-5" aria-hidden />
          </ButtonLink>
          <Button variant="outline" size="lg" onClick={onLoadMaria}>
            <Sparkles className="h-5 w-5 text-amber-600" aria-hidden /> Demo: Maria&apos;s case
          </Button>
        </div>
      </Card>
    </div>
  );
}
