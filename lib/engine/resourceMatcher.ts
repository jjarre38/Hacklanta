import type { CaseStatus, HousingBarrier, Resource, ResourceCategory, ResourceMatch, ResourceStatus, UserCase } from "@/types";
import { effectiveStage } from "./caseClassifier";
import { normalizeCounty } from "@/lib/data/serviceArea";

// Deterministic resource scoring. Pure function — no I/O.
//
// score = county match (required when a county is known)
//       + category relevance to the case status (primary category, or 60% for a secondary one)
//       + availability (OPEN > WAITLIST > FUNDS_LIMITED > UNKNOWN > CLOSED)
//       + household fit (children, reduced income)
//       + recovery-barrier boost ("What is making housing hardest?")

export const STATUS_SCORE: Record<ResourceStatus, number> = {
  OPEN: 20,
  WAITLIST: 10,
  FUNDS_LIMITED: 8,
  UNKNOWN: 5,
  CLOSED: -50,
};

export const STATUS_RANK: Record<ResourceStatus, number> = { OPEN: 0, WAITLIST: 1, FUNDS_LIMITED: 2, UNKNOWN: 3, CLOSED: 4 };

const RELEVANCE: Record<CaseStatus, Partial<Record<ResourceCategory, number>>> = {
  PREVENTION: {
    RENTAL_ASSISTANCE: 35,
    EVICTION_LEGAL_AID: 18,
    UTILITY_ASSISTANCE: 16,
    PUBLIC_BENEFITS: 15,
    FOOD_ASSISTANCE: 14,
    EMPLOYMENT_ASSISTANCE: 10,
    WORKFORCE_DEVELOPMENT: 8,
    CHILDCARE_FAMILY: 8,
  },
  URGENT_INTERVENTION: {
    RENTAL_ASSISTANCE: 35,
    EVICTION_LEGAL_AID: 30,
    PUBLIC_BENEFITS: 14,
    UTILITY_ASSISTANCE: 12,
    FOOD_ASSISTANCE: 12,
    EMPLOYMENT_ASSISTANCE: 8,
    CHILDCARE_FAMILY: 6,
  },
  LEGAL_HELP_RECOMMENDED: {
    EVICTION_LEGAL_AID: 40,
    RENTAL_ASSISTANCE: 30,
    PUBLIC_BENEFITS: 12,
    FOOD_ASSISTANCE: 10,
    UTILITY_ASSISTANCE: 10,
    TEMPORARY_HOUSING: 6,
  },
  TRANSITION_RECOVERY: {
    AFFORDABLE_HOUSING: 32,
    SECURITY_DEPOSIT_ASSISTANCE: 30,
    TEMPORARY_HOUSING: 28,
    EMERGENCY_SHELTER: 22,
    MOVING_ASSISTANCE: 24,
    EMPLOYMENT_ASSISTANCE: 22,
    WORKFORCE_DEVELOPMENT: 20,
    PUBLIC_BENEFITS: 18,
    FOOD_ASSISTANCE: 18,
    CHILDCARE_FAMILY: 14,
    EVICTION_LEGAL_AID: 14,
    UTILITY_ASSISTANCE: 8,
    RENTAL_ASSISTANCE: 4,
  },
};

const BARRIER_BOOST: Record<HousingBarrier, ResourceCategory[]> = {
  DEPOSIT_AND_FEES: ["SECURITY_DEPOSIT_ASSISTANCE"],
  EVICTION_RECORD: ["EVICTION_LEGAL_AID"],
  INCOME_TOO_LOW: ["EMPLOYMENT_ASSISTANCE", "WORKFORCE_DEVELOPMENT", "PUBLIC_BENEFITS"],
  NEED_PLACE_TONIGHT: ["EMERGENCY_SHELTER", "TEMPORARY_HOUSING"],
  MOVING_COSTS: ["MOVING_ASSISTANCE", "SECURITY_DEPOSIT_ASSISTANCE"],
  CHILDCARE_OR_FAMILY: ["CHILDCARE_FAMILY"],
};

export const BARRIER_LABELS: Record<HousingBarrier, string> = {
  DEPOSIT_AND_FEES: "Deposit and application fees",
  EVICTION_RECORD: "An eviction on my record",
  INCOME_TOO_LOW: "My income is too low for most places",
  NEED_PLACE_TONIGHT: "I need somewhere to stay right now",
  MOVING_COSTS: "Moving costs and furniture",
  CHILDCARE_OR_FAMILY: "Childcare or family needs",
};

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  RENTAL_ASSISTANCE: "Rental assistance",
  EVICTION_LEGAL_AID: "Legal aid",
  UTILITY_ASSISTANCE: "Utility assistance",
  FOOD_ASSISTANCE: "Food assistance",
  AFFORDABLE_HOUSING: "Affordable housing",
  EMERGENCY_SHELTER: "Emergency shelter",
  TEMPORARY_HOUSING: "Temporary housing",
  SECURITY_DEPOSIT_ASSISTANCE: "Deposit assistance",
  MOVING_ASSISTANCE: "Moving assistance",
  WORKFORCE_DEVELOPMENT: "Job training",
  EMPLOYMENT_ASSISTANCE: "Employment help",
  PUBLIC_BENEFITS: "Benefits navigation",
  CHILDCARE_FAMILY: "Childcare & family",
};

export interface MatchOptions {
  county?: string;
  categories?: ResourceCategory[];
  openOnly?: boolean;
  limit?: number;
  /** Override the case status used for relevance (e.g. browsing without a case). */
  statusOverride?: CaseStatus;
}

function categoriesOf(r: Resource): ResourceCategory[] {
  return [r.category, ...(r.secondaryCategories ?? [])];
}

export function resourceServesCounty(r: Resource, county: string): boolean {
  const n = normalizeCounty(county).toLowerCase();
  return r.countiesServed.some((c) => c.toLowerCase() === n);
}

export function matchResources(
  resources: Resource[],
  userCase: Partial<UserCase> | null,
  options: MatchOptions = {},
): ResourceMatch[] {
  const county = options.county ?? userCase?.county;
  const caseStatus = options.statusOverride ?? userCase?.caseStatus;
  const relevance = caseStatus ? RELEVANCE[caseStatus] : undefined;
  const barrierCats = userCase?.housingBarrier ? BARRIER_BOOST[userCase.housingBarrier] : [];

  const matches: ResourceMatch[] = [];
  for (const r of resources) {
    const cats = categoriesOf(r);
    const evaluation = evaluateResource(r, userCase, county);
    if (evaluation.excluded || r.status === "CLOSED") continue;
    if (userCase?.demoScenario?.simulated && userCase.demoScenario.immediateAssistanceUnavailable && (r.category === "RENTAL_ASSISTANCE" || (options.categories?.length === 1 && options.categories[0] === "RENTAL_ASSISTANCE"))) continue;
    if (options.categories?.length && !cats.some((c) => options.categories!.includes(c))) continue;
    if (options.openOnly && r.status !== "OPEN") continue;

    const reasons: string[] = [...evaluation.reasons];
    let score = 0;

    if (county) {
      if (!resourceServesCounty(r, county)) continue;
      score += 40;
      reasons.push(`Serves ${normalizeCounty(county)} County`);
    }

    if (relevance) {
      const primary = relevance[r.category] ?? 0;
      const secondary = Math.max(0, ...(r.secondaryCategories ?? []).map((c) => (relevance[c] ?? 0) * 0.6));
      const rel = Math.max(primary, secondary);
      score += rel;
      if (rel >= 25) reasons.push(relevanceReason(caseStatus!, r.category));
    }

    score += STATUS_SCORE[r.status];
    if (r.status === "OPEN") reasons.push("Listed as accepting applications");
    if (r.status === "WAITLIST") reasons.push("Has a waitlist — apply early");
    if (r.status === "FUNDS_LIMITED") reasons.push("Funds are limited — apply soon");

    if (userCase?.hasChildren && r.servesFamiliesWithChildren) {
      score += 8;
      reasons.push("Serves families with children");
    }
    if (userCase?.incomeRecentlyReduced && cats.some((c) => c === "EMPLOYMENT_ASSISTANCE" || c === "WORKFORCE_DEVELOPMENT" || c === "PUBLIC_BENEFITS")) {
      score += 6;
      reasons.push("Can help after a drop in income");
    }
    if (barrierCats.length && cats.some((c) => barrierCats.includes(c))) {
      score += 22;
      reasons.push(`Addresses what you said is hardest: ${BARRIER_LABELS[userCase!.housingBarrier!].toLowerCase()}`);
    }

    matches.push({ resource: r, score, reasons, eligibility: evaluation.eligibility, availability: r.status, constraintsEvaluated: evaluation.constraintsEvaluated });
  }

  // Closed resources always sort last; otherwise by score, then availability, then name.
  matches.sort((a, b) => {
    const closedA = a.resource.status === "CLOSED" ? 1 : 0;
    const closedB = b.resource.status === "CLOSED" ? 1 : 0;
    if (closedA !== closedB) return closedA - closedB;
    if (b.score !== a.score) return b.score - a.score;
    const s = STATUS_RANK[a.resource.status] - STATUS_RANK[b.resource.status];
    if (s !== 0) return s;
    return a.resource.name.localeCompare(b.resource.name);
  });

  return options.limit ? matches.slice(0, options.limit) : matches;
}

function relevanceReason(status: CaseStatus, category: ResourceCategory): string {
  const label = CATEGORY_LABELS[category].toLowerCase();
  switch (status) {
    case "PREVENTION":
      return `${CATEGORY_LABELS[category]} can help you catch up before a filing`;
    case "URGENT_INTERVENTION":
      return `With an eviction filed, ${label} is a top priority`;
    case "LEGAL_HELP_RECOMMENDED":
      return `Your deadline is close — ${label} is a top priority`;
    case "TRANSITION_RECOVERY":
      return `${CATEGORY_LABELS[category]} supports your next step`;
  }
}

/** Exclusions require published restrictions. Passing known checks is not eligibility approval. */
export function evaluateResource(r: Resource, c: Partial<UserCase> | null, county = c?.county) {
  const constraintsEvaluated: string[] = [];
  const reasons: string[] = [];
  let excluded = false;
  let unknown = !county;
  if (county) { constraintsEvaluated.push("county"); if (!resourceServesCounty(r, county)) { excluded = true; reasons.push("Outside the published service counties."); } }
  if (r.restrictionSourceUrl) {
    if (r.zipCodesServed?.length) {
      constraintsEvaluated.push("ZIP");
      if (!c?.zipCode) { unknown = true; reasons.push("ZIP eligibility needs confirmation."); }
      else if (!r.zipCodesServed.includes(c.zipCode)) { excluded = true; reasons.push("Outside the published ZIP restriction."); }
    }
    if (r.requiresEvictionFiling) {
      constraintsEvaluated.push("eviction filing");
      const stage = c?.evictionStage ? effectiveStage({ evictionStage: c.evictionStage, courtDate: c.courtDate }) : undefined;
      if (!stage || stage === "UNSURE") { unknown = true; reasons.push("A filing is required; your filing status is unknown."); }
      else if (["BEHIND_ON_RENT", "NOTICE_RECEIVED"].includes(stage)) { excluded = true; reasons.push("A filed eviction is required."); }
    }
    if (r.familiesOnly) {
      constraintsEvaluated.push("family restriction");
      if (c?.hasChildren === undefined) unknown = true;
      else if (!c.hasChildren) { excluded = true; reasons.push("This program requires children in the household."); }
    }
  } else if (r.zipCodesServed?.length || r.requiresEvictionFiling || r.familiesOnly) {
    unknown = true; reasons.push("Restriction metadata lacks a verified source; check with the provider.");
  }
  reasons.push("Provider must confirm eligibility and capacity; a match is not approval.");
  if (r.status === "UNKNOWN") reasons.push("Current application or funding availability is unknown.");
  return { excluded, eligibility: (unknown ? "UNKNOWN" : "POTENTIALLY_RELEVANT") as "UNKNOWN" | "POTENTIALLY_RELEVANT", constraintsEvaluated, reasons };
}
