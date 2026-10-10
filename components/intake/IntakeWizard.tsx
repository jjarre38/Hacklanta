"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Lock, Sparkles } from "lucide-react";
import type { UserCase } from "@/types";
import { conditionalIssues, intakeSchema, type IntakeValues } from "@/lib/intake/schema";
import { INTAKE_STEPS } from "@/lib/intake/steps";
import { mariaIntake } from "@/lib/demo/mariaSeed";
import { createCaseFromIntake } from "@/lib/services/caseService";
import { getSessionId, saveCase } from "@/lib/client/caseStore";
import { PRIVACY_NOTE } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AssistanceStep, EvictionStageStep, FinancialStep, HouseholdStep, LandlordStep, LocationStep, OUT_OF_AREA } from "./steps";

const DEFAULTS: Partial<IntakeValues> = {
  zipCode: "",
  county: "",
  paymentPlanDiscussed: false,
  paymentPlanRejected: false,
  landlordName: "",
};

export function IntakeWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<IntakeValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });

  const step = INTAKE_STEPS[stepIndex];
  const isLast = stepIndex === INTAKE_STEPS.length - 1;
  const county = form.watch("county");
  const blockedOutOfArea = step.id === "location" && county === OUT_OF_AREA;

  async function next() {
    const ok = await form.trigger(step.fields, { shouldFocus: true });
    if (!ok) return;
    const stepIssues = conditionalIssues(form.getValues()).filter((i) => step.fields.includes(i.path));
    if (stepIssues.length) {
      stepIssues.forEach((i) => form.setError(i.path, { type: "custom", message: i.message }, { shouldFocus: true }));
      return;
    }
    if (isLast) {
      await form.handleSubmit(complete, (errors) => {
        // Jump back to the first step that still has a problem.
        const idx = INTAKE_STEPS.findIndex((s) => s.fields.some((f) => f in errors));
        if (idx >= 0) setStepIndex(idx);
      })();
    } else {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function complete(values: IntakeValues) {
    setSubmitting(true);
    setSubmitError(null);
    let userCase: UserCase;
    try {
      const res = await fetch("/api/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), intake: values }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      userCase = (await res.json()).case as UserCase;
    } catch {
      // Same deterministic logic runs client-side if the API is unreachable.
      userCase = createCaseFromIntake(values);
    }
    try {
      saveCase(userCase);
      router.push("/dashboard");
    } catch {
      setSubmitting(false);
      setSubmitError("We couldn't save your plan in this browser. Please check that storage is enabled and try again.");
    }
  }

  function loadMaria() {
    form.reset({ ...DEFAULTS, ...mariaIntake() });
    setStepIndex(INTAKE_STEPS.length - 1);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">{step.group}</p>
          <p className="text-sm text-ink-muted">
            Step {stepIndex + 1} of {INTAKE_STEPS.length}
          </p>
        </div>
        <button
          type="button"
          onClick={loadMaria}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
        >
          <Sparkles className="h-4 w-4" aria-hidden /> Demo: Load Maria&apos;s Case
        </button>
      </div>
      <ProgressBar value={stepIndex + 1} max={INTAKE_STEPS.length} label={`Progress: step ${stepIndex + 1} of ${INTAKE_STEPS.length}`} className="mb-6 [&>div:first-child]:sr-only" />

      <Card className="p-6 sm:p-8">
        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!blockedOutOfArea) void next();
            }}
            noValidate
          >
            <h1 className="text-2xl font-bold tracking-tight">{step.title}</h1>
            <p className="mt-1 text-ink-soft">{step.subtitle}</p>

            <div key={step.id} className="mt-7">
              {step.id === "location" && <LocationStep />}
              {step.id === "rent" && <FinancialStep screen="rent" />}
              {step.id === "money" && <FinancialStep screen="money" />}
              {step.id === "household" && <HouseholdStep screen="household" />}
              {step.id === "work" && <HouseholdStep screen="work" />}
              {step.id === "landlord" && <LandlordStep />}
              {step.id === "assistance" && <AssistanceStep />}
              {step.id === "stage" && <EvictionStageStep />}
            </div>

            {submitError && (
              <p className="mt-6 rounded-xl bg-coral-50 p-3 text-sm text-coral-700" role="alert">
                {submitError}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || submitting}>
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back
              </Button>
              <Button type="submit" size="lg" disabled={submitting || blockedOutOfArea}>
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Building your plan…
                  </>
                ) : isLast ? (
                  <>
                    Build my plan <ArrowRight className="h-5 w-5" aria-hidden />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-5 w-5" aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>

      <p className="mt-5 flex items-start justify-center gap-2 text-center text-sm text-ink-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {PRIVACY_NOTE}
      </p>
    </div>
  );
}
