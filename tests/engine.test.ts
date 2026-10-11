import test from "node:test";
import assert from "node:assert/strict";
import type { Resource, UserCase } from "@/types";
import { resetMaria, runMariaTransition, simulateMariaAssistanceUnavailable } from "@/lib/demo/mariaSeed";
import { classifyCase } from "@/lib/engine/caseClassifier";
import { applyCaseUpdate, reclassify, applyExtractedDocument } from "@/lib/services/caseService";
import { generateActionPlan } from "@/lib/services/recommendationService";
import { calculateFinancialGap } from "@/lib/engine/resourceCombinationEngine";
import { buildPaymentPlan, sumInstallments } from "@/lib/services/paymentPlanService";
import { evaluateResource, matchResources } from "@/lib/engine/resourceMatcher";
import { RESOURCES } from "@/lib/data/resources";
import { daysUntil, isISODate, toISODate } from "@/lib/format";
import { userCaseSchema } from "@/lib/validation/case";

const now = new Date("2026-10-10T16:00:00Z");
const maria = (patch: Partial<UserCase> = {}) => reclassify({ ...resetMaria(now), ...patch }, now);
const gap = (patch: Partial<UserCase> = {}, resources = RESOURCES) => calculateFinancialGap(maria(patch), resources, now);
const fixture: Resource = { id: "test", name: "Test provider", category: "RENTAL_ASSISTANCE", countiesServed: ["Fulton"], status: "OPEN", lastVerified: "2026-10-10", eligibilitySummary: "Test fixture only", applicationMethod: "Test", typicalAmount: 5000 };

for (const [stage, expected] of [["BEHIND_ON_RENT", "PREVENTION"], ["NOTICE_RECEIVED", "PREVENTION"], ["EVICTION_FILED", "URGENT_INTERVENTION"], ["COURT_DATE_SCHEDULED", "URGENT_INTERVENTION"], ["UNSURE", "LEGAL_HELP_RECOMMENDED"], ["JUDGMENT_ENTERED", "LEGAL_HELP_RECOMMENDED"]] as const) {
  test(`case: ${stage}, no known court date`, () => {
    const c = maria({ evictionStage: stage, courtDate: undefined });
    assert.equal(c.caseStatus, expected);
    if (stage === "EVICTION_FILED") assert.ok(generateActionPlan(c, now).some(a => a.id === "file-answer" && a.urgency === "TODAY"));
  });
}
test("court in seven days is urgent legal help", () => {
  const c = maria();
  assert.equal(daysUntil(c.courtDate, now), 7);
  assert.equal(classifyCase(c, now).legalUrgency, "IMMEDIATE");
  assert.equal(c.caseStatus, "LEGAL_HELP_RECOMMENDED");
});
test("court today includes hearing actions today", () => {
  const c = maria({ courtDate: "2026-10-10" });
  assert.ok(classifyCase(c, now).reasons[0].includes("today"));
  assert.equal(generateActionPlan(c, now).find(a => a.id === "attend-hearing")?.urgency, "TODAY");
});
for (const patch of [{ assistanceStatus: "DENIED" }, { paymentPlanRejected: true }, { assistanceStatus: "DENIED", paymentPlanRejected: true }, { evictionStage: "JUDGMENT_ENTERED", assistanceStatus: "DENIED", paymentPlanRejected: true }] satisfies Partial<UserCase>[]) {
  test(`denial/rejection/judgment do not exhaust paths: ${JSON.stringify(patch)}`, () => {
    const c = maria(patch);
    assert.notEqual(c.caseStatus, "TRANSITION_RECOVERY");
    assert.equal(classifyCase(c, now).preservation?.recoveryPriority, false);
  });
}
test("explicit transition retains legal and hearing guidance", () => {
  const c = applyCaseUpdate(maria(), { type: "STAYING_NOT_REALISTIC" }, now);
  assert.equal(c.caseStatus, "TRANSITION_RECOVERY");
  const ids = generateActionPlan(c, now).map(a => a.id);
  assert.ok(ids.includes("contact-legal-aid") && ids.includes("attend-hearing-recovery") && ids.includes("deposit-help"));
});
test("recovery after judgment retains legal remedies even after new housing found", () => {
  const c = maria({ newHousingFound: true, evictionStage: "JUDGMENT_ENTERED" });
  assert.ok(generateActionPlan(c, now).some(a => a.id === "judgment-options" && a.urgency === "TODAY"));
});
test("Maria full sequence recomputes finances, priorities, resources and resets", () => {
  const c = maria();
  const rejected = applyCaseUpdate(c, { type: "LANDLORD_REJECTED_PLAN" }, now);
  assert.equal(rejected.caseStatus, "LEGAL_HELP_RECOMMENDED");
  assert.equal(classifyCase(rejected, now).preservation?.paths[0].state, "DECLINED");
  const changed = simulateMariaAssistanceUnavailable(rejected, now);
  assert.equal(changed.caseStatus, "TRANSITION_RECOVERY");
  assert.equal(classifyCase(changed, now).legalUrgency, "IMMEDIATE");
  assert.ok(classifyCase(changed, now).reasons.join(" ").includes("SIMULATION"));
  assert.equal(calculateFinancialGap(c, RESOURCES, now).confirmedRemainingGap, 900);
  const moving = calculateFinancialGap(changed, RESOURCES, now);
  assert.equal(moving.amountOwed, 2900);
  assert.equal(moving.confirmedRemainingGap, 2400);
  assert.equal(moving.outstandingRentDebt, 1400);
  assert.equal(moving.obligationIsEstimate, true);
  const before = matchResources(RESOURCES, c).map(m => m.resource.id);
  const after = matchResources(RESOURCES, changed).map(m => m.resource.id);
  assert.notDeepEqual(before, after);
  assert.ok(before.includes("svdp-georgia") && !after.includes("svdp-georgia"));
  assert.ok(generateActionPlan(changed, now).some(a => a.id === "employment-recovery"));
  const reset = resetMaria(now);
  assert.equal(reset.demoScenario, undefined);
  assert.equal(reset.paymentPlanRejected, false);
  assert.equal(reset.caseStatus, c.caseStatus);
  assert.deepEqual(calculateFinancialGap(reset, RESOURCES, now), calculateFinancialGap(c, RESOURCES, now));
});
test("simulated unavailable assistance alone does not force transition", () => {
  assert.notEqual(simulateMariaAssistanceUnavailable(maria(), now).caseStatus, "TRANSITION_RECOVERY");
  assert.notEqual(runMariaTransition(maria({ availableToday: 1400 }), now).caseStatus, "TRANSITION_RECOVERY");
});
test("simulation removes assistance opportunities without mutating the real catalog", () => {
  const c = simulateMariaAssistanceUnavailable(maria(), now);
  assert.equal(calculateFinancialGap(c, [fixture], now).potentialSupport.length, 0);
  assert.equal(matchResources(RESOURCES, c, { categories: ["RENTAL_ASSISTANCE"] }).length, 0);
  assert.equal(fixture.status, "OPEN");
});
test("reclassification clears stale completions and records reasons", () => {
  const c = runMariaTransition(maria({ completedActionIds: ["contact-legal-aid", "deposit-help"] }), now);
  assert.deepEqual(c.completedActionIds, []);
  assert.ok(c.events.some(e => e.type === "STATUS_CHANGED" && e.description.includes("SIMULATION")));
});
test("pending application differs from waitlist; malformed payments and dates rejected", () => {
  assert.equal(applyCaseUpdate(maria(), { type: "ASSISTANCE_APPLIED" }, now).assistanceStatus, "PENDING");
  for (const n of [-1, NaN, Infinity, 1500]) assert.throws(() => applyCaseUpdate(maria(), { type: "PAYMENT_MADE", amountPaid: n }, now));
  assert.throws(() => applyCaseUpdate(maria(), { type: "COURT_DATE_SET", courtDate: "2026-02-30" }, now));
  assert.throws(() => applyExtractedDocument(maria(), { confidence: "HIGH", courtDate: "2026-02-30" }, now));
});

test("finance: no funds", () => assert.equal(gap({ availableToday: 0 }).confirmedRemainingGap, 1400));
test("finance: only reported housing cash counts by default", () => {
  assert.equal(gap().confirmedHousingFunds, 500);
  assert.equal(gap().nextPaycheckContribution, 0);
  assert.equal(gap().remainingGap, 900);
});
for (const status of ["OPEN", "WAITLIST", "FUNDS_LIMITED", "UNKNOWN"] as const) {
  test(`finance: ${status} estimates never reduce confirmed gap`, () => {
    const g = gap({}, [{ ...fixture, status }]);
    assert.equal(g.remainingGap, 900);
    assert.equal(g.totalEstimatedAssistance, 0);
    assert.equal(g.sources.length, 0);
    assert.equal(g.potentialSupport.length, 1);
  });
}
test("finance: approved amount requires amount, purpose and timing", () => {
  assert.equal(gap({ assistanceStatus: "APPROVED" }).remainingGap, 900);
  assert.equal(gap({ assistanceStatus: "APPROVED", approvedAssistanceAmount: 400 }).remainingGap, 900);
  assert.equal(gap({ assistanceStatus: "APPROVED", approvedAssistanceAmount: 400, approvedAssistancePurpose: "STAY", approvedAssistanceAvailableDate: "2026-10-12" }).remainingGap, 500);
  assert.equal(gap({ assistanceStatus: "APPROVED", approvedAssistanceAmount: 400, approvedAssistancePurpose: "MOVE", approvedAssistanceAvailableDate: "2026-10-12" }).remainingGap, 900);
});
for (const date of [undefined, "2026-10-20", "2026-10-09", "2026-02-30"]) {
  test(`finance: paycheck excluded with late/missing/stale/invalid date ${date}`, () => assert.equal(gap({ nextPaycheckHousingAllocation: 400, nextPaycheckDate: date }).remainingGap, 900));
}
test("finance: explicit allocation, reserves, large gap and exact cents", () => {
  assert.equal(gap({ nextPaycheckHousingAllocation: 300 }).remainingGap, 600);
  assert.equal(gap({ nextPaycheckHousingAllocation: 400, essentialReservePerPaycheck: 200 }).nextPaycheckContribution, 250);
  assert.equal(gap({ essentialReserveToday: 300, maxAffordableToday: 100 }).availableToday, 100);
  assert.equal(gap({ amountOwed: 999999 }).remainingGap, 999499);
  assert.equal(gap({ amountOwed: 1000.31, availableToday: 300.22 }).remainingGap, 700.09);
});

test("plan: Maria remains an illustration totaling $1400", () => {
  const p = buildPaymentPlan(maria(), now);
  assert.deepEqual(p.installments.map(i => i.amount), [500, 450, 450]);
  assert.equal(sumInstallments(p.installments), 1400);
  assert.equal(p.affordability, "ILLUSTRATIVE");
});
test("plan: zero debt and excess upfront cash", () => {
  assert.equal(buildPaymentPlan(maria({ amountOwed: 0 }), now).installments.length, 0);
  const p = buildPaymentPlan(maria({ amountOwed: 200, availableToday: 500 }), now);
  assert.equal(sumInstallments(p.installments), 200);
  assert.equal(p.unallocatedBalance, 0);
});
test("plan: cap and essential reserves respected with explicit constraints", () => {
  const p = buildPaymentPlan(maria({ maxAffordableToday: 100, essentialReserveToday: 200, maxAffordablePerPaycheck: 125, essentialReservePerPaycheck: 350, payIntervalDays: 7 }), now);
  assert.equal(p.installments[0].amount, 100);
  assert.ok(p.installments.slice(1).every(i => i.amount <= 100));
  assert.equal(p.unallocatedBalance, 700);
  assert.equal(p.feasible, false);
  assert.equal(p.affordability, "USER_CONSTRAINED");
});
test("plan: large debt does not defeat six-installment cap", () => {
  const p = buildPaymentPlan(maria({ amountOwed: 50000, maxAffordablePerPaycheck: 50 }), now);
  assert.equal(p.installments.length, 7);
  assert.ok(p.installments.slice(1).every(i => i.amount <= 50));
  assert.equal(p.unallocatedBalance, 49200);
});
test("plan: no income/cash invents no payments", () => {
  const p = buildPaymentPlan(maria({ availableToday: 0, monthlyIncome: 0, nextPaycheckAmount: 0 }), now);
  assert.equal(p.installments.length, 0);
  assert.equal(p.feasible, false);
});
test("plan: cannot afford removes future installments", () => {
  const p = buildPaymentPlan(maria({ canAffordPaymentPlan: false }), now);
  assert.equal(p.affordability, "NOT_AFFORDABLE");
  assert.equal(p.installments.length, 1);
  assert.equal(p.unallocatedBalance, 900);
});
test("plan: missing/past payday uses future illustrative dates", () => {
  for (const date of [undefined, "2025-01-01"]) {
    const p = buildPaymentPlan(maria({ nextPaycheckDate: date }), now);
    assert.equal(p.affordability, "ILLUSTRATIVE");
    assert.equal(p.installments[1].dueDate, "2026-10-24");
  }
});
test("plan: cents conserve debt under many balances and caps", () => {
  for (const debt of [0.01, 0.3, 50.07, 999.99, 10000.11]) for (const cap of [0, 0.01, 33.33, 450]) {
    const p = buildPaymentPlan(maria({ amountOwed: debt, availableToday: 0.1, maxAffordablePerPaycheck: cap }), now);
    assert.ok(sumInstallments(p.installments) <= debt);
    assert.equal(Math.round((sumInstallments(p.installments) + p.unallocatedBalance) * 100), Math.round(debt * 100));
    assert.ok(p.installments.slice(1).every(i => i.amount <= cap));
  }
});

test("matcher: county match/exclusion and unknown county", () => {
  assert.equal(matchResources([fixture], maria()).length, 1);
  assert.equal(matchResources([fixture], maria({ county: "Cobb" })).length, 0);
  assert.equal(matchResources([fixture], null)[0].eligibility, "UNKNOWN");
});
test("matcher: sourced ZIP restriction and unknown ZIP", () => {
  const r = { ...fixture, zipCodesServed: ["30310"], restrictionSourceUrl: "https://example.org/test-only" };
  assert.equal(matchResources([r], maria()).length, 1);
  assert.equal(matchResources([r], maria({ zipCode: "30311" })).length, 0);
  assert.equal(evaluateResource(r, { county: "Fulton" }).eligibility, "UNKNOWN");
  assert.equal(evaluateResource({ ...r, restrictionSourceUrl: undefined }, maria({ zipCode: "30311" })).excluded, false);
});
test("matcher: sourced filing requirement and family restriction", () => {
  const r = { ...fixture, requiresEvictionFiling: true, familiesOnly: true, restrictionSourceUrl: "https://example.org/test-only" };
  assert.equal(matchResources([r], maria()).length, 1);
  assert.equal(matchResources([r], maria({ evictionStage: "BEHIND_ON_RENT", courtDate: undefined })).length, 0);
  assert.equal(matchResources([r], maria({ hasChildren: false })).length, 0);
  assert.equal(evaluateResource(r, maria({ evictionStage: "UNSURE", courtDate: undefined })).eligibility, "UNKNOWN");
});
test("matcher: closed excluded, unknown retained, deterministic rankings", () => {
  assert.equal(matchResources([{ ...fixture, status: "CLOSED" }], maria()).length, 0);
  const m = matchResources([{ ...fixture, status: "UNKNOWN" }], maria())[0];
  assert.equal(m.availability, "UNKNOWN");
  assert.ok(m.reasons.some(r => r.includes("unknown")));
  assert.deepEqual(matchResources(RESOURCES, maria()), matchResources(RESOURCES, maria()));
});
test("matcher: recovery categories reprioritized", () => {
  const housing = { ...fixture, id: "housing", category: "AFFORDABLE_HOUSING" as const };
  assert.equal(matchResources([fixture, housing], maria())[0].resource.id, "test");
  assert.equal(matchResources([fixture, housing], maria({ stayingNotRealistic: true }))[0].resource.id, "housing");
});
test("catalog: five-county scope, unique IDs, no invented dollar awards or openings", () => {
  assert.equal(new Set(RESOURCES.map(r => r.id)).size, RESOURCES.length);
  for (const r of RESOURCES) {
    assert.ok(r.countiesServed.every(c => ["Fulton", "DeKalb", "Cobb", "Gwinnett", "Clayton"].includes(c)));
    assert.ok(r.sourceUrl?.startsWith("https://"));
    assert.equal(r.typicalAmount, undefined);
    assert.equal(r.status, "UNKNOWN");
  }
});
test("calendar: invalid dates, Atlanta midnight and DST", () => {
  assert.equal(isISODate("2026-02-30"), false);
  assert.equal(isISODate("2024-02-29"), true);
  assert.equal(toISODate(new Date("2026-10-11T01:00:00Z")), "2026-10-10");
  assert.equal(daysUntil("2026-03-09", new Date("2026-03-07T17:00:00Z")), 2);
});
test("validation: Maria and simulated state accepted; nested malformed data rejected", () => {
  assert.equal(userCaseSchema.safeParse(maria()).success, true);
  assert.equal(userCaseSchema.safeParse(runMariaTransition(maria(), now)).success, true);
  for (const patch of [{ monthlyRent: "100" }, { availableToday: -1 }, { events: [{ id: "fake" }] }, { completedActionIds: [12] }, { courtDate: "2026-02-30" }, { county: "Other" }, { paymentPlanRejected: true, paymentPlanAccepted: true }, { nextPaycheckHousingAllocation: 451 }]) {
    assert.equal(userCaseSchema.safeParse({ ...maria(), ...patch }).success, false);
  }
});

test("rescheduled hearing clears obsolete legal completions even without status change", () => {
  const c = maria({ completedActionIds: ["attend-hearing", "contact-legal-aid", "keep-records"] });
  const updated = applyCaseUpdate(c, { type: "COURT_DATE_SET", courtDate: "2026-10-16" }, now);
  assert.equal(updated.caseStatus, c.caseStatus);
  assert.deepEqual(updated.completedActionIds, ["keep-records"]);
});
test("unknown or past hearing generates urgent verification, including in recovery", () => {
  for (const date of [undefined, "2026-10-01"]) {
    const c = maria({ courtDate: date, stayingNotRealistic: true, legalAidContacted: true });
    const actions = generateActionPlan(c, now);
    assert.ok(actions.some(a => a.id === "confirm-court-date" && a.urgency === "TODAY"));
    assert.ok(actions.some(a => a.id === "follow-up-legal-aid" && a.urgency === "TODAY"));
    assert.ok(!actions.some(a => a.reason.includes("in -")));
  }
});

test("specific hearing date overrides stale pre-filing stage for classification and filing checks", () => {
  const c = maria({ evictionStage: "BEHIND_ON_RENT", courtDate: "2026-11-30" });
  assert.equal(c.caseStatus, "URGENT_INTERVENTION");
  assert.equal(evaluateResource({ ...fixture, requiresEvictionFiling: true, restrictionSourceUrl: "https://example.org/test" }, c).excluded, false);
});
test("real sourced catalog restrictions participate in matching", () => {
  const duluth = RESOURCES.find(r => r.id === "duluth-coop-food")!;
  assert.equal(matchResources([duluth], maria({ county: "Gwinnett", zipCode: "30097" })).length, 1);
  assert.equal(matchResources([duluth], maria({ county: "Gwinnett", zipCode: "30044" })).length, 0);
  const avlf = RESOURCES.find(r => r.id === "avlf-safe-stable-homes")!;
  assert.equal(matchResources([avlf], maria({ evictionStage: "BEHIND_ON_RENT", courtDate: undefined })).length, 0);
  assert.equal(matchResources([avlf], maria()).length, 1);
});

test("simulation does not force recovery when explicitly allocated timely income covers the debt", () => {
  const c = runMariaTransition(maria({ nextPaycheckAmount: 1000, nextPaycheckHousingAllocation: 900 }), now);
  assert.notEqual(c.caseStatus, "TRANSITION_RECOVERY");
  assert.equal(calculateFinancialGap(c, RESOURCES, now).confirmedRemainingGap, 0);
});
test("funds arriving after an already-passed court cutoff are excluded", () => {
  assert.equal(gap({ courtDate: "2026-10-09", nextPaycheckDate: "2026-10-10", nextPaycheckHousingAllocation: 400 }).nextPaycheckContribution, 0);
});
test("fractional-cent contribution caps are never rounded upward", () => {
  const p = buildPaymentPlan(maria({ maxAffordablePerPaycheck: 33.339, maxAffordableToday: 10.009 }), now);
  assert.ok(p.installments[0].amount <= 10.009);
  assert.ok(p.installments.slice(1).every(i => i.amount <= 33.339));
});
