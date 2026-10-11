"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ClipboardList, Sparkles, X } from "lucide-react";
import type { CaseStatus, CaseUpdate, ExtractedDocument, HousingBarrier, UserCase } from "@/types";
import { clearCase, useCase } from "@/lib/client/caseStore";
import { useResources } from "@/lib/client/useResources";
import { applyCaseUpdate, applyExtractedDocument, createCaseFromIntake, toggleActionCompleted } from "@/lib/services/caseService";
import { generateActionPlan } from "@/lib/services/recommendationService";
import { matchResources } from "@/lib/engine/resourceMatcher";
import { STATUS_META } from "@/lib/engine/caseClassifier";
import { mariaIntake } from "@/lib/demo/mariaSeed";
import { makeId } from "@/lib/format";
import { LEGAL_DISCLAIMER } from "@/lib/copy";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
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

export function DashboardClient() {
  const { userCase, loaded, update } = useCase();
  const { resources } = useResources();
  const [transition, setTransition] = useState<Transition | null>(null);
  const [justChanged, setJustChanged] = useState(false);
  const [activeTab, setActiveTab] = useState<PlanTab>("actions");
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
  const tabs: { id: PlanTab; label: string }[] = [
    { id: "actions", label: "Action plan" },
    ...(!recovery && userCase.amountOwed > 0 ? [{ id: "payment" as const, label: "Payment plan" }] : []),
    ...(!recovery ? [{ id: "matches" as const, label: "Best matches" }] : []),
  ];
  // Fall back to the action plan if the selected tab disappears (e.g. after moving to recovery).
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : "actions";

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
        </div>
      </div>

      {transition && <TransitionNotice transition={transition} onDismiss={() => setTransition(null)} />}

      <StatusBanner userCase={userCase} justChanged={justChanged} />

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
                aria-selected={currentTab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  currentTab === t.id ? "bg-white text-brand-700 shadow-sm" : "text-ink-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`panel-${currentTab}`} aria-labelledby={`tab-${currentTab}`}>
            {currentTab === "actions" && (
              <ActionPlan
                key={userCase.caseStatus}
                items={actions}
                recovery={recovery}
                onToggle={(id) => latest.current && commit(toggleActionCompleted(latest.current, id))}
              />
            )}
            {currentTab === "payment" && (
              <PaymentPlanCalculator key={`${userCase.amountOwed}-${userCase.availableToday}-${userCase.nextPaycheckDate}`} userCase={userCase} />
            )}
            {currentTab === "matches" && (
              <section aria-labelledby="top-resources">
                <div className="mb-3 flex items-center justify-between">
                  <h2 id="top-resources" className="text-lg font-semibold">
                    Best matches for you
                  </h2>
                  <Link href="/resources" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                    All resources <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {topMatches.map((m) => (
                    <ResourceCard key={m.resource.id} match={m} compact />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <FinancialSummary userCase={userCase} resources={resources} />
          <CaseUpdatePanel onSubmit={applyUpdate} />
          <DocumentUpload onApply={applyDocument} />
          <CaseTimeline userCase={userCase} />
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
