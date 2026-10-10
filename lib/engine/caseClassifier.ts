import type { CaseStatus, EvictionStage, UserCase } from "@/types";
import { daysUntil } from "@/lib/format";

// Deterministic case classification. No AI involved.
//
// Rules are evaluated from most to least specific; the first match wins:
//
// 1. TRANSITION_RECOVERY — staying is no longer realistic:
//    a. the user explicitly says staying is not realistic, or has found new housing
//    b. judgment entered AND no assistance is available (assistance denied or
//       landlord rejected a payment plan)
//    c. landlord rejected a payment plan AND rental assistance was denied AND
//       the case has reached the court-date stage or later
// 2. LEGAL_HELP_RECOMMENDED — the legal situation needs a professional:
//    court date within 7 days, judgment entered, or an ambiguous legal
//    situation (stage unsure, or a court date that has passed without a judgment)
// 3. URGENT_INTERVENTION — eviction filed, court date scheduled, or a court
//    date within 14 days
// 4. PREVENTION — behind on rent or holding a notice, no filing, no imminent deadline

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
  /** Plain-language reasons for the chosen status. */
  reasons: string[];
  /** Assumptions made because data was missing or ambiguous. */
  assumptions: string[];
}

/** A filed case with a known court date is treated as "court date scheduled". */
export function effectiveStage(c: Pick<UserCase, "evictionStage" | "courtDate">): EvictionStage {
  if (c.evictionStage === "EVICTION_FILED" && c.courtDate) return "COURT_DATE_SCHEDULED";
  return c.evictionStage;
}

export function classifyCase(c: UserCase, now: Date = new Date()): Classification {
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
  const assistanceDenied = c.assistanceStatus === "DENIED";
  if (stage === "JUDGMENT_ENTERED" && (assistanceDenied || c.paymentPlanRejected)) {
    return {
      status: "TRANSITION_RECOVERY",
      reasons: [
        "A judgment has been entered in your case.",
        assistanceDenied ? "Rental assistance was denied." : "Your landlord rejected a payment plan.",
      ],
      assumptions,
    };
  }
  if (c.paymentPlanRejected && assistanceDenied && stageRank >= STAGE_ORDER.COURT_DATE_SCHEDULED) {
    return {
      status: "TRANSITION_RECOVERY",
      reasons: [
        "Your landlord rejected a payment plan.",
        "Rental assistance isn't available right now.",
        "Your case has already reached the court stage.",
      ],
      assumptions,
    };
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
