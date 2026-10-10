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

export function DashboardClient() {
  const { userCase, loaded, update } = useCase();
  const { resources } = useResources();
  const [transition, setTransition] = useState<Transition | null>(null);
  const [justChanged, setJustChanged] = useState(false);
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

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your HomePath plan</h1>
          <p className="text-ink-muted">Here&apos;s what you can still do next. Your plan updates as your situation changes.</p>
        </div>
        <Link href="/intake" className="text-sm font-semibold text-brand-700 hover:underline">
          Start over with new answers
        </Link>
      </div>

      {transition && <TransitionNotice transition={transition} onDismiss={() => setTransition(null)} />}

      <StatusBanner userCase={userCase} justChanged={justChanged} />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {recovery && <RecoveryMode userCase={userCase} resources={resources} onBarrierChange={setBarrier} />}
          <ActionPlan
            key={userCase.caseStatus}
            items={actions}
            recovery={recovery}
            onToggle={(id) => latest.current && commit(toggleActionCompleted(latest.current, id))}
          />
          {!recovery && userCase.amountOwed > 0 && (
            <PaymentPlanCalculator key={`${userCase.amountOwed}-${userCase.availableToday}-${userCase.nextPaycheckDate}`} userCase={userCase} />
          )}
          {!recovery && (
            <section aria-labelledby="top-resources">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="top-resources" className="text-lg font-semibold">
                  Best matches for you
                </h2>
                <Link href="/resources" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                  All resources <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {topMatches.map((m) => (
                  <ResourceCard key={m.resource.id} match={m} compact />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
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
          <FinancialSummary userCase={userCase} resources={resources} />
          <CaseUpdatePanel onSubmit={applyUpdate} />
          <DocumentUpload onApply={applyDocument} />
          <CaseTimeline userCase={userCase} />
        </aside>
      </div>

      <p className="mt-10 rounded-xl bg-slate-100 p-4 text-sm text-ink-soft">{LEGAL_DISCLAIMER}</p>
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
