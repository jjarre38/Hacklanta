import { resetMaria, simulateMariaAssistanceUnavailable } from "../lib/demo/mariaSeed";
import { applyCaseUpdate } from "../lib/services/caseService";
import { classifyCase } from "../lib/engine/caseClassifier";
import { calculateFinancialGap } from "../lib/engine/resourceCombinationEngine";
import { generateActionPlan } from "../lib/services/recommendationService";
import { matchResources } from "../lib/engine/resourceMatcher";
import { buildPaymentPlan } from "../lib/services/paymentPlanService";
import { RESOURCES } from "../lib/data/resources";
import type { UserCase } from "../types";

// Optional fixed ISO instant makes judge evidence reproducible on any machine.
const now = process.argv[2] ? new Date(process.argv[2]) : new Date();
if (!Number.isFinite(now.getTime())) throw new Error("Pass a valid ISO instant.");
const initial = resetMaria(now);
const rejected = applyCaseUpdate(initial, { type: "LANDLORD_REJECTED_PLAN", note: "SIMULATION" }, now);
const recovery = simulateMariaAssistanceUnavailable(rejected, now);
const snapshot = (c: UserCase) => ({
  classification: classifyCase(c, now),
  financial: calculateFinancialGap(c, RESOURCES, now),
  actions: generateActionPlan(c, now).map(({ id, title, urgency, reason }) => ({ id, title, urgency, reason })),
  resources: matchResources(RESOURCES, c).map(({ resource, score, eligibility }) => ({ id: resource.id, score, eligibility })),
});
console.log(JSON.stringify({
  label: "FICTIONAL MARIA DEMO — computed offline, no impact claims or outcome prediction",
  asOf: now.toISOString(),
  input: { county: initial.county, zipCode: initial.zipCode, monthlyRent: initial.monthlyRent, amountOwed: initial.amountOwed, availableToday: initial.availableToday, nextPaycheckAmount: initial.nextPaycheckAmount, nextPaycheckDate: initial.nextPaycheckDate, householdSize: initial.householdSize, hasChildren: initial.hasChildren, incomeRecentlyReduced: initial.incomeRecentlyReduced, evictionStage: initial.evictionStage, courtDate: initial.courtDate },
  initial: snapshot(initial), paymentProposal: buildPaymentPlan(initial, now),
  rejected: snapshot(rejected), recovery: snapshot(recovery),
  reset: { caseStatus: resetMaria(now).caseStatus, gap: calculateFinancialGap(resetMaria(now), RESOURCES, now).confirmedRemainingGap },
}, null, 2));
