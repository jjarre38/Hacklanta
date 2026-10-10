import type { PaymentInstallment, PaymentPlan, UserCase } from "@/types";
import { addDays, parseDate, toISODate } from "@/lib/format";

// Deterministic payment plan math. Pure functions — no I/O.
//
// 1. Pay what's available today up front.
// 2. Split the remainder into installments no larger than one paycheck
//    (or 25% of monthly rent / $100 minimum when paycheck is unknown).
// 3. Schedule installments on paydays (every 14 days from the next paycheck)
//    or monthly when paycheck timing is unknown. Max 6 installments.

const MAX_INSTALLMENTS = 6;

export function buildPaymentPlan(c: UserCase, now: Date = new Date()): PaymentPlan {
  const totalOwed = Math.max(0, Math.round(c.amountOwed || 0));
  const upfront = Math.min(totalOwed, Math.max(0, Math.round(c.availableToday || 0)));
  const installments: PaymentInstallment[] = [];

  if (upfront > 0) {
    installments.push({ amount: upfront, dueDate: toISODate(now), label: "Payment today" });
  }

  let remaining = totalOwed - upfront;
  if (remaining > 0) {
    const perPaycheck = c.nextPaycheckAmount && c.nextPaycheckAmount > 0 ? Math.round(c.nextPaycheckAmount) : 0;
    const fallbackChunk = Math.max(100, Math.round((c.monthlyRent || 0) * 0.25));
    const maxChunk = perPaycheck || fallbackChunk;
    const count = Math.min(MAX_INSTALLMENTS, Math.max(1, Math.ceil(remaining / maxChunk)));
    const base = Math.floor(remaining / count);

    const firstDate = c.nextPaycheckDate ? parseDate(c.nextPaycheckDate) : addDays(now, 14);
    const intervalDays = c.nextPaycheckDate ? 14 : 30;

    for (let i = 0; i < count; i++) {
      // The last installment absorbs rounding so the plan always sums to the total owed.
      const amount = i === count - 1 ? remaining : base;
      installments.push({
        amount,
        dueDate: toISODate(addDays(firstDate, i * intervalDays)),
        label: c.nextPaycheckDate ? `Payday installment ${i + 1}` : `Installment ${i + 1}`,
      });
      remaining -= amount;
    }
  }

  return { totalOwed, availableToday: upfront, installments };
}

export function sumInstallments(installments: PaymentInstallment[]): number {
  return installments.reduce((s, i) => s + (Number.isFinite(i.amount) ? i.amount : 0), 0);
}

export function remainingBalance(plan: PaymentPlan): number {
  return plan.totalOwed - sumInstallments(plan.installments);
}
