import type { FinancialGap, Resource, UserCase } from "@/types";
import { formatMoney } from "@/lib/format";
import { matchResources } from "./resourceMatcher";

export const MOVING_COST_ESTIMATE = 400;
export { money, housingCash } from "./housingFunds";
import { money, housingCash, allocatedPaycheck, fundsArriveInTime } from "./housingFunds";

/** Confirmed means user-reported and explicitly allocated, not independently verified. */
export function calculateFinancialGap(c: UserCase, resources: Resource[], now: Date = new Date()): FinancialGap {
  const mode = c.caseStatus === "TRANSITION_RECOVERY" ? "MOVE" : "STAY";
  const assumptions = ["Amounts are user-reported. Matches are opportunities, not awards; verify amounts and payment timing with providers."];
  const amountOwed = mode === "STAY" ? money(c.amountOwed) : money(c.monthlyRent * 2 + MOVING_COST_ESTIMATE);
  if (mode === "MOVE") assumptions.push(`Illustrative move budget: deposit and first month at your current rent plus ${formatMoney(MOVING_COST_ESTIMATE)} moving costs. Existing rent debt is separate and is not erased.`);
  const availableToday = housingCash(c);
  const nextPaycheckContribution = allocatedPaycheck(c, mode, now);
  if (!c.nextPaycheckHousingAllocation) assumptions.push("No explicit housing allocation from the next paycheck; none is counted.");
  else if (!nextPaycheckContribution) assumptions.push("Allocated paycheck is missing a valid upcoming date, arrives after court, or has no spendable amount; it is not counted.");
  else assumptions.push("The explicitly allocated paycheck is expected income, not cash already received. Confirm timing; the court date is only a planning cutoff, not a payment deadline.");
  const confirmedAssistance = c.assistanceStatus === "APPROVED" && c.approvedAssistancePurpose === mode && !(mode === "STAY" && c.demoScenario?.simulated && c.demoScenario.immediateAssistanceUnavailable) && fundsArriveInTime(c, c.approvedAssistanceAvailableDate, mode, now) ? money(c.approvedAssistanceAmount) : 0;
  if (c.assistanceStatus === "APPROVED" && !confirmedAssistance) assumptions.push("Approval lacks a usable amount, purpose, or upcoming payment date; no award is counted.");
  if (c.assistanceStatus === "DENIED") assumptions.push("One denied application does not rule out other programs.");
  if (c.demoScenario?.immediateAssistanceUnavailable) assumptions.push("SIMULATION: modeled immediate rent-assistance opportunities are unavailable; provider listings have not changed.");
  const categories: Resource["category"][] = mode === "STAY" ? ["RENTAL_ASSISTANCE"] : ["SECURITY_DEPOSIT_ASSISTANCE", "MOVING_ASSISTANCE"];
  const potentialSupport = (mode === "STAY" && c.demoScenario?.simulated && c.demoScenario.immediateAssistanceUnavailable ? [] : matchResources(resources, c, { categories })).map(({ resource: r, eligibility, reasons }) => ({ resourceId: r.id, name: r.name, amount: null, status: r.status, eligibility, reasons }));
  const confirmedHousingFunds = money(availableToday + nextPaycheckContribution + confirmedAssistance);
  const confirmedRemainingGap = money(amountOwed - confirmedHousingFunds);
  return { mode, amountOwed, availableToday, nextPaycheckContribution,
    gapBeforeAssistance: money(amountOwed - availableToday - nextPaycheckContribution),
    // Legacy chart fields deliberately contain no hypothetical dollars.
    sources: [], totalEstimatedAssistance: 0, remainingGap: confirmedRemainingGap,
    assumptions, confirmedHousingFunds, confirmedAssistance, confirmedRemainingGap, potentialSupport,
    obligationIsEstimate: mode === "MOVE", outstandingRentDebt: money(c.amountOwed) };
}
