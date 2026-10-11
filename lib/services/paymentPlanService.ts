import type { PaymentInstallment, PaymentPlan, UserCase } from "@/types";
import { addDays, daysUntil, parseDate, toISODate } from "@/lib/format";
import { housingCash, money, moneyLimit } from "@/lib/engine/housingFunds";

const MAX_INSTALLMENTS = 6;

export function buildPaymentPlan(c: UserCase, now: Date = new Date()): PaymentPlan {
  const cents = (n: number) => Math.round(money(n) * 100);
  const total = cents(c.amountOwed);
  const upfront = Math.min(total, cents(housingCash(c)));
  const installments: PaymentInstallment[] = [];
  const assumptions: string[] = ["Proposal only: ongoing rent and essential living costs still need to be paid. Landlord agreement does not change court deadlines automatically."];
  if (upfront > 0) installments.push({ amount: upfront / 100, dueDate: toISODate(now), label: "Proposed payment today" });
  let remaining = total - upfront;
  const explicit = c.maxAffordablePerPaycheck !== undefined;
  const spendablePaycheck = Math.max(0, money(c.nextPaycheckAmount) - money(c.essentialReservePerPaycheck));
  const cap = c.canAffordPaymentPlan ? Math.round(moneyLimit(Math.min(c.maxAffordablePerPaycheck ?? spendablePaycheck, c.nextPaycheckAmount === undefined ? Infinity : spendablePaycheck)) * 100) : 0;
  const days = daysUntil(c.nextPaycheckDate, now);
  const knownDate = days !== null && days > 0;
  const firstDate = knownDate ? parseDate(c.nextPaycheckDate!) : addDays(now, 14);
  const interval = c.payIntervalDays && c.payIntervalDays >= 1 && c.payIntervalDays <= 60 ? Math.floor(c.payIntervalDays) : 14;
  if (!knownDate) assumptions.push("Next payday is unknown or not in the future; dates are editable illustrations beginning in 14 days.");
  if (!c.payIntervalDays) assumptions.push("Illustrative 14-day pay interval; confirm your actual pay schedule.");
  if (!explicit) assumptions.push("No affordable contribution was supplied. Paycheck amounts are illustrative ceilings, not proof of affordability.");
  if (!c.canAffordPaymentPlan) assumptions.push("You reported the plan is unaffordable; no future installments are proposed.");
  for (let i = 0; i < MAX_INSTALLMENTS && remaining > 0 && cap > 0; i++) {
    const amount = Math.min(cap, remaining);
    installments.push({ amount: amount / 100, dueDate: toISODate(addDays(firstDate, interval * i)), label: `Proposed installment ${i + 1}` });
    remaining -= amount;
  }
  if (remaining > 0) assumptions.push("The proposed schedule leaves an unpaid balance. No installment was increased to force the debt to fit.");
  return { totalOwed: total / 100, availableToday: upfront / 100, installments, unallocatedBalance: remaining / 100,
    feasible: remaining === 0, affordability: !c.canAffordPaymentPlan ? "NOT_AFFORDABLE" : explicit && c.maxAffordableToday !== undefined && knownDate && c.payIntervalDays ? "USER_CONSTRAINED" : "ILLUSTRATIVE", assumptions };
}

export function sumInstallments(installments: PaymentInstallment[]): number {
  return installments.reduce((sum, i) => sum + Math.round(money(i.amount) * 100), 0) / 100;
}
export function remainingBalance(plan: PaymentPlan): number {
  return money(plan.totalOwed - sumInstallments(plan.installments));
}
