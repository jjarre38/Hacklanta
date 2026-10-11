import { allocatedPaycheck, housingCash } from "./housingFunds";
import type { CaseStatus, EvictionStage, UserCase } from "@/types";
import { daysUntil, isISODate } from "@/lib/format";

// Deterministic classification; recovery priority never predicts a legal outcome.

export const STAGE_ORDER: Record<EvictionStage, number> = {
  UNSURE: -1,
  BEHIND_ON_RENT: 0,
  NOTICE_RECEIVED: 1,
  EVICTION_FILED: 2,
  COURT_DATE_SCHEDULED: 3,
  JUDGMENT_ENTERED: 4,
};

export interface Classification {
  status: CaseStatus;
  legalUrgency?: "IMMEDIATE" | "SOON" | "VERIFY" | "ROUTINE";
  preservation?: PreservationEvaluation;
  /** Plain-language reasons for the chosen status. */
  reasons: string[];
  /** Assumptions made because data was missing or ambiguous. */
  assumptions: string[];
}

/** A valid reported hearing date is more specific than an earlier/unknown stage. */
export function effectiveStage(c: Pick<UserCase, "evictionStage" | "courtDate">): EvictionStage {
  if (c.evictionStage !== "JUDGMENT_ENTERED" && c.courtDate && isISODate(c.courtDate)) return "COURT_DATE_SCHEDULED";
  return c.evictionStage;
}

function classifyStatus(c: UserCase, now: Date): Classification {
  const assumptions: string[] = [];
  const stage = effectiveStage(c);
  const stageRank = STAGE_ORDER[stage];
  const daysToCourt = daysUntil(c.courtDate, now);

  if ((stage === "EVICTION_FILED" || stage === "COURT_DATE_SCHEDULED") && daysToCourt === null) {
    assumptions.push("We don't have a court date yet, so we're treating your deadline as soon and unknown.");
  }
  if (!c.monthlyIncome) {
    assumptions.push("Monthly income is $0 or missing, so payment plan math assumes no regular income.");
  }

  // 1. TRANSITION_RECOVERY
  if (c.stayingNotRealistic) {
    return { status: "TRANSITION_RECOVERY", reasons: ["You told us staying in your current home isn't realistic."], assumptions };
  }
  if (c.newHousingFound) {
    return { status: "TRANSITION_RECOVERY", reasons: ["You found new housing — the focus now is a stable move."], assumptions };
  }
  if (evaluatePreservation(c, now).recoveryPriority) {
    return { status: "TRANSITION_RECOVERY", reasons: evaluatePreservation(c, now).reasons, assumptions };
  }

  // 2. LEGAL_HELP_RECOMMENDED
  if (daysToCourt !== null && daysToCourt >= 0 && daysToCourt <= 7) {
    return {
      status: "LEGAL_HELP_RECOMMENDED",
      reasons: [daysToCourt === 0 ? "Your court date is today." : `Your court date is in ${daysToCourt} day${daysToCourt === 1 ? "" : "s"}.`],
      assumptions,
    };
  }
  if (stage === "JUDGMENT_ENTERED") {
    return {
      status: "LEGAL_HELP_RECOMMENDED",
      reasons: ["A judgment has been entered. There may be a short window to act, so legal help matters now."],
      assumptions,
    };
  }
  if (stage === "UNSURE") {
    assumptions.push("You weren't sure what stage your case is in, so we recommend confirming it with legal aid or the court.");
    return {
      status: "LEGAL_HELP_RECOMMENDED",
      reasons: ["It isn't clear where your case stands legally."],
      assumptions,
    };
  }
  if (daysToCourt !== null && daysToCourt < 0 && stageRank >= STAGE_ORDER.EVICTION_FILED) {
    return {
      status: "LEGAL_HELP_RECOMMENDED",
      reasons: ["Your court date has passed, and we don't know the outcome."],
      assumptions,
    };
  }

  // 3. URGENT_INTERVENTION
  if (stageRank >= STAGE_ORDER.EVICTION_FILED) {
    return {
      status: "URGENT_INTERVENTION",
      reasons: [stage === "COURT_DATE_SCHEDULED" ? "You have a court date scheduled." : "An eviction has been filed against you."],
      assumptions,
    };
  }
  if (daysToCourt !== null && daysToCourt >= 0 && daysToCourt <= 14) {
    return { status: "URGENT_INTERVENTION", reasons: [`Your court date is in ${daysToCourt} days.`], assumptions };
  }

  // 4. PREVENTION
  return {
    status: "PREVENTION",
    reasons: [
      stage === "NOTICE_RECEIVED"
        ? "You've received a notice, but no eviction has been filed yet. Acting now gives you the most options."
        : "You're behind on rent, but no eviction has been filed. This is the best time to act.",
    ],
    assumptions,
  };
}

export const STATUS_META: Record<CaseStatus, { label: string; short: string; tone: "blue" | "amber" | "coral" | "violet"; description: string }> = {
  PREVENTION: {
    label: "Prevention",
    short: "Prevention",
    tone: "blue",
    description: "You have time to act. Focus on closing the rent gap and talking with your landlord.",
  },
  URGENT_INTERVENTION: {
    label: "Urgent Intervention",
    short: "Urgent",
    tone: "amber",
    description: "An eviction case is moving. Act this week on assistance, your landlord, and legal help.",
  },
  LEGAL_HELP_RECOMMENDED: {
    label: "Legal Help Recommended",
    short: "Legal help",
    tone: "coral",
    description: "Your deadline is close. Contact free legal aid today and keep working on assistance.",
  },
  TRANSITION_RECOVERY: {
    label: "Transition & Recovery",
    short: "Recovery",
    tone: "violet",
    description: "Staying may not be possible — so the plan now is a safe, stable next home and a strong recovery.",
  },
};

export interface PreservationEvaluation {
  recoveryPriority: boolean;
  simulated: boolean;
  reasons: string[];
  paths: { id: "PAYMENT_ARRANGEMENT" | "ASSISTANCE" | "OWN_FUNDS" | "LEGAL_REVIEW"; state: "UNCERTAIN" | "ATTEMPTED" | "DECLINED" | "UNAVAILABLE" | "CONFIRMED"; reason: string }[];
}

export function evaluatePreservation(c: UserCase, now: Date = new Date()): PreservationEvaluation {
  const simulated = c.demoScenario?.simulated === true && c.demoScenario.immediateAssistanceUnavailable;
  const selfFunds = housingCash(c) + allocatedPaycheck(c, "STAY", now);
  const simulationTransition = simulated && c.paymentPlanRejected && selfFunds < c.amountOwed;
  const recoveryPriority = Boolean(c.stayingNotRealistic || c.newHousingFound || simulationTransition);
  const reasons = c.stayingNotRealistic ? ["You reported that staying is unrealistic; transition support and legal guidance can proceed together."]
    : c.newHousingFound ? ["You reported new housing; prioritize a stable move and remaining court obligations."]
    : simulationTransition ? ["SIMULATION: the payment arrangement was declined, modeled immediate assistance is unavailable, and reported, timely allocated housing funds do not cover the debt. Prioritize backup housing; legal options remain unassessed."]
    : ["Preservation options still need review. One denial, a declined arrangement, or a judgment does not establish that all options are exhausted."];
  return { recoveryPriority, simulated, reasons, paths: [
    { id: "PAYMENT_ARRANGEMENT", state: c.paymentPlanRejected ? "DECLINED" : c.paymentPlanAccepted ? "CONFIRMED" : c.paymentPlanDiscussed ? "ATTEMPTED" : "UNCERTAIN", reason: c.paymentPlanRejected ? "This arrangement was declined; other negotiations are not ruled out." : "Acceptance and ability to keep an arrangement must both be checked." },
    { id: "ASSISTANCE", state: simulated ? "UNAVAILABLE" : c.assistanceStatus === "APPROVED" ? "CONFIRMED" : c.appliedForAssistance ? "ATTEMPTED" : "UNCERTAIN", reason: simulated ? "Simulated unavailability of modeled immediate rent assistance; not a statement about real providers." : "Each program decides separately. An approval still needs an amount and payment timing." },
    { id: "OWN_FUNDS", state: selfFunds >= c.amountOwed ? "CONFIRMED" : "UNAVAILABLE", reason: selfFunds >= c.amountOwed ? "Reported cash and explicitly allocated timely income cover the debt; verify receipt and the amount due." : "Reported, timely allocated housing funds cannot cover the reported debt; new funds may change this." },
    { id: "LEGAL_REVIEW", state: "UNCERTAIN", reason: "A qualified legal professional must assess defenses, deadlines, and remedies. HomePath cannot determine the outcome." },
  ] };
}

export function classifyCase(c: UserCase, now: Date = new Date()): Classification {
  const result = classifyStatus(c, now);
  const days = daysUntil(c.courtDate, now);
  const stage = effectiveStage(c);
  const legalUrgency = stage === "JUDGMENT_ENTERED" || (days !== null && days <= 7) ? "IMMEDIATE"
    : stage === "UNSURE" || (stage === "COURT_DATE_SCHEDULED" && days === null) ? "VERIFY"
    : STAGE_ORDER[stage] >= 2 || days !== null ? "SOON" : "ROUTINE";
  return { ...result, legalUrgency, preservation: evaluatePreservation(c, now) };
}
