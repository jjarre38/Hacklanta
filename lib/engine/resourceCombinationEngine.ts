import type { FinancialGap, FundingSource, Resource, ResourceCategory, UserCase } from "@/types";
import { daysUntil, formatMoney } from "@/lib/format";
import { resourceServesCounty, STATUS_RANK } from "./resourceMatcher";

// Calculates how multiple resources could combine to close a financial gap.
// Pure function. All assistance amounts come from the demo `typicalAmount`
// field and are labeled as estimates in the UI.
//
// STAY mode (prevention / urgent / legal help):
//   gap = amount owed - available today - next paycheck (if it arrives before court)
// MOVE mode (transition & recovery):
//   need = security deposit (1 month) + first month's rent + moving estimate
//   gap  = need - available today - next paycheck

export const MOVING_COST_ESTIMATE = 400;

export function calculateFinancialGap(c: UserCase, resources: Resource[], now: Date = new Date()): FinancialGap {
  const mode: FinancialGap["mode"] = c.caseStatus === "TRANSITION_RECOVERY" ? "MOVE" : "STAY";
  const assumptions: string[] = [];

  const rent = Math.max(0, c.monthlyRent || 0);
  const amountNeeded =
    mode === "STAY" ? Math.max(0, c.amountOwed || 0) : rent * 2 + MOVING_COST_ESTIMATE;
  if (mode === "MOVE") {
    assumptions.push(
      `Move-in estimate: deposit (${formatMoney(rent)}) + first month (${formatMoney(rent)}) + moving (${formatMoney(MOVING_COST_ESTIMATE)}), based on your current rent.`,
    );
  }

  const availableToday = Math.max(0, c.availableToday || 0);

  let nextPaycheckContribution = 0;
  if (c.nextPaycheckAmount && c.nextPaycheckAmount > 0) {
    const daysToPay = daysUntil(c.nextPaycheckDate, now);
    const daysToCourt = daysUntil(c.courtDate, now);
    if (mode === "STAY" && daysToPay !== null && daysToCourt !== null && daysToPay > daysToCourt) {
      assumptions.push("Your next paycheck arrives after your court date, so it isn't counted toward the gap.");
    } else {
      nextPaycheckContribution = c.nextPaycheckAmount;
      assumptions.push("Assumes your full next paycheck can go toward this. Adjust if you need it for other bills.");
    }
  }

  const gapBeforeAssistance = Math.max(0, amountNeeded - availableToday - nextPaycheckContribution);

  const sourceCategories: ResourceCategory[] =
    mode === "STAY" ? ["RENTAL_ASSISTANCE"] : ["SECURITY_DEPOSIT_ASSISTANCE", "MOVING_ASSISTANCE"];

  const candidates = resources
    .filter(
      (r) =>
        r.status !== "CLOSED" &&
        (r.typicalAmount ?? 0) > 0 &&
        resourceServesCounty(r, c.county) &&
        [r.category, ...(r.secondaryCategories ?? [])].some((cat) => sourceCategories.includes(cat)),
    )
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || (b.typicalAmount ?? 0) - (a.typicalAmount ?? 0));

  if (mode === "STAY" && c.assistanceStatus === "DENIED") {
    assumptions.push("One application was denied. Other programs have separate funding and rules, so they're still shown.");
  }

  // Greedily add sources until the gap is closed (never over-claim the last one).
  const sources: FundingSource[] = [];
  let remaining = gapBeforeAssistance;
  for (const r of candidates) {
    if (remaining <= 0) break;
    const estimatedAmount = Math.min(r.typicalAmount ?? 0, remaining);
    sources.push({ resourceId: r.id, name: r.name, estimatedAmount, status: r.status });
    remaining -= estimatedAmount;
  }

  if (gapBeforeAssistance > 0 && sources.length === 0) {
    assumptions.push("No programs with estimated amounts serve your county yet — 2-1-1 can check for newly opened funds.");
  }

  const totalEstimatedAssistance = sources.reduce((s, x) => s + x.estimatedAmount, 0);

  return {
    mode,
    amountOwed: amountNeeded,
    availableToday,
    nextPaycheckContribution,
    gapBeforeAssistance,
    sources,
    totalEstimatedAssistance,
    remainingGap: Math.max(0, gapBeforeAssistance - totalEstimatedAssistance),
    assumptions,
  };
}
