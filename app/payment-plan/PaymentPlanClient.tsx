"use client";

import { useState } from "react";
import type { UserCase } from "@/types";
import { useCase } from "@/lib/client/caseStore";
import { createCaseFromIntake } from "@/lib/services/caseService";
import { PaymentPlanCalculator } from "@/components/paymentplan/PaymentPlanCalculator";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface QuickNumbers {
  amountOwed: string;
  availableToday: string;
  monthlyRent: string;
  nextPaycheckAmount: string;
  nextPaycheckDate: string;
}

/** Builds a throwaway case from a few numbers so the calculator works without intake. Nothing is saved. */
function quickCase(n: QuickNumbers): UserCase {
  return createCaseFromIntake({
    zipCode: "00000",
    county: "",
    monthlyRent: Number(n.monthlyRent) || 0,
    amountOwed: Number(n.amountOwed) || 0,
    availableToday: Number(n.availableToday) || 0,
    monthlyIncome: 0,
    nextPaycheckAmount: Number(n.nextPaycheckAmount) || undefined,
    nextPaycheckDate: n.nextPaycheckDate || undefined,
    householdSize: 1,
    hasChildren: false,
    employmentStatus: "EMPLOYED_FULL_TIME",
    incomeRecentlyReduced: false,
    contactedLandlord: false,
    paymentPlanDiscussed: false,
    paymentPlanRejected: false,
    canAffordPaymentPlan: true,
    appliedForAssistance: false,
    evictionStage: "BEHIND_ON_RENT",
  });
}

export function PaymentPlanClient() {
  const { userCase, loaded } = useCase();
  const [numbers, setNumbers] = useState<QuickNumbers>({ amountOwed: "", availableToday: "", monthlyRent: "", nextPaycheckAmount: "", nextPaycheckDate: "" });
  const [manual, setManual] = useState<UserCase | null>(null);

  if (!loaded) return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" aria-busy="true" />;
  if (userCase && userCase.amountOwed > 0) return <PaymentPlanCalculator userCase={userCase} />;
  if (manual) return <PaymentPlanCalculator key={JSON.stringify(numbers)} userCase={manual} />;

  const fields: { key: keyof QuickNumbers; label: string; type: "number" | "date" }[] = [
    { key: "amountOwed", label: "How much do you owe?", type: "number" },
    { key: "availableToday", label: "How much can you pay today?", type: "number" },
    { key: "monthlyRent", label: "Monthly rent", type: "number" },
    { key: "nextPaycheckAmount", label: "Next paycheck amount (optional)", type: "number" },
    { key: "nextPaycheckDate", label: "Next payday (optional)", type: "date" },
  ];

  return (
    <Card>
      <p className="text-ink-soft">Enter a few numbers to build a plan. Nothing here is saved.</p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(numbers.amountOwed) > 0) setManual(quickCase(numbers));
        }}
      >
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={`pp-${f.key}`} className="field-label">
              {f.label}
            </label>
            <input
              id={`pp-${f.key}`}
              type={f.type}
              min={0}
              inputMode={f.type === "number" ? "decimal" : undefined}
              className="field-input"
              value={numbers[f.key]}
              onChange={(e) => setNumbers({ ...numbers, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={!(Number(numbers.amountOwed) > 0)}>
            Build my payment plan
          </Button>
        </div>
      </form>
    </Card>
  );
}
