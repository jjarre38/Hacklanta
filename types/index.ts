// Shared HomePath types. These are used by the UI, the API routes, and the
// deterministic engines in lib/engine. Keep them free of runtime imports.

export type EvictionStage =
  | "BEHIND_ON_RENT"
  | "NOTICE_RECEIVED"
  | "EVICTION_FILED"
  | "COURT_DATE_SCHEDULED"
  | "JUDGMENT_ENTERED"
  | "UNSURE";

export type CaseStatus =
  | "PREVENTION"
  | "URGENT_INTERVENTION"
  | "LEGAL_HELP_RECOMMENDED"
  | "TRANSITION_RECOVERY";

export type ResourceCategory =
  | "RENTAL_ASSISTANCE"
  | "EVICTION_LEGAL_AID"
  | "UTILITY_ASSISTANCE"
  | "FOOD_ASSISTANCE"
  | "AFFORDABLE_HOUSING"
  | "EMERGENCY_SHELTER"
  | "TEMPORARY_HOUSING"
  | "SECURITY_DEPOSIT_ASSISTANCE"
  | "MOVING_ASSISTANCE"
  | "WORKFORCE_DEVELOPMENT"
  | "EMPLOYMENT_ASSISTANCE"
  | "PUBLIC_BENEFITS"
  | "CHILDCARE_FAMILY";

export type ResourceStatus = "OPEN" | "WAITLIST" | "FUNDS_LIMITED" | "CLOSED" | "UNKNOWN";

export type AssistanceStatus = "APPROVED" | "DENIED" | "WAITLISTED" | "NOT_ATTEMPTED" | "PENDING";

export type EmploymentStatus =
  | "EMPLOYED_FULL_TIME"
  | "EMPLOYED_PART_TIME"
  | "SELF_EMPLOYED"
  | "UNEMPLOYED"
  | "UNABLE_TO_WORK"
  | "RETIRED";

/** Answer to "What is making housing hardest right now?" in recovery mode. */
export type HousingBarrier =
  | "DEPOSIT_AND_FEES"
  | "EVICTION_RECORD"
  | "INCOME_TOO_LOW"
  | "NEED_PLACE_TONIGHT"
  | "MOVING_COSTS"
  | "CHILDCARE_OR_FAMILY";

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  /** Additional categories this organization also serves. */
  secondaryCategories?: ResourceCategory[];
  countiesServed: string[];
  zipCodesServed?: string[];
  address?: string;
  phone?: string;
  website?: string;
  eligibilitySummary: string;
  applicationMethod: string;
  status: ResourceStatus;
  lastVerified: string; // ISO date
  /** Legacy demo estimate; ignored by the financial engine. */
  typicalAmount?: number;
  /** Eligibility hints used by the matcher. */
  servesFamiliesWithChildren?: boolean;
  requiresEvictionFiling?: boolean;
  sourceUrl?: string;
  verificationNotes?: string;
  /** Published restrictions only; never infer a restriction from a service hint. */
  restrictionSourceUrl?: string;
  familiesOnly?: boolean;
}

export interface CaseEvent {
  id: string;
  type: string;
  description: string;
  date: string;
  isUserAction: boolean;
}

export interface UserCase {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Location
  zipCode: string;
  county: string;
  state: string;
  // Financials
  monthlyRent: number;
  amountOwed: number;
  availableToday: number;
  monthlyIncome: number;
  nextPaycheckAmount?: number;
  nextPaycheckDate?: string;
  /** Explicit allocation, not the entire paycheck. */
  nextPaycheckHousingAllocation?: number;
  maxAffordableToday?: number;
  essentialReserveToday?: number;
  maxAffordablePerPaycheck?: number;
  essentialReservePerPaycheck?: number;
  payIntervalDays?: number;
  approvedAssistanceAmount?: number;
  approvedAssistanceAvailableDate?: string;
  approvedAssistancePurpose?: "STAY" | "MOVE";
  demoScenario?: { simulated: true; immediateAssistanceUnavailable: boolean; label: string };
  // Household
  householdSize: number;
  hasChildren: boolean;
  employmentStatus: EmploymentStatus | string;
  incomeRecentlyReduced: boolean;
  // Landlord
  contactedLandlord: boolean;
  paymentPlanDiscussed: boolean;
  paymentPlanRejected: boolean;
  paymentPlanAccepted?: boolean;
  canAffordPaymentPlan: boolean;
  landlordName?: string;
  // Assistance
  appliedForAssistance: boolean;
  assistanceStatus?: AssistanceStatus;
  // Eviction stage
  evictionStage: EvictionStage;
  courtDate?: string;
  caseNumber?: string;
  // Follow-up state set from the dashboard
  legalAidContacted?: boolean;
  newHousingFound?: boolean;
  /** User explicitly said staying in their current home is not realistic. */
  stayingNotRealistic?: boolean;
  housingBarrier?: HousingBarrier;
  // Computed
  caseStatus: CaseStatus;
  // Events / updates
  events: CaseEvent[];
  /** IDs of action items the user has checked off. */
  completedActionIds: string[];
}

export type ActionUrgency = "TODAY" | "BEFORE_COURT" | "THIS_WEEK" | "ONGOING";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  reason: string; // Why this was recommended
  urgency: ActionUrgency;
  completed: boolean;
  /** Optional in-app link for the action (e.g. /rights). */
  href?: string;
}

export interface PaymentInstallment {
  amount: number;
  dueDate: string;
  label: string;
}

export interface PaymentPlan {
  totalOwed: number;
  availableToday: number;
  installments: PaymentInstallment[];
  proposalText?: string; // AI-drafted landlord message
  unallocatedBalance: number;
  feasible: boolean;
  affordability: "ILLUSTRATIVE" | "USER_CONSTRAINED" | "NOT_AFFORDABLE";
  assumptions: string[];
}

export interface ExtractedDocument {
  landlordName?: string | null;
  tenantName?: string | null;
  amountClaimed?: number | null;
  filingDate?: string | null;
  courtDate?: string | null;
  caseNumber?: string | null;
  county?: string | null;
  deadlines?: string[] | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

export interface ResourceMatch {
  resource: Resource;
  score: number;
  /** Plain-language reasons this resource was matched. */
  reasons: string[];
  eligibility: "POTENTIALLY_RELEVANT" | "UNKNOWN";
  availability: ResourceStatus;
  constraintsEvaluated: string[];
}

export interface FundingSource {
  resourceId: string;
  name: string;
  estimatedAmount: number;
  status: ResourceStatus;
}

export interface FinancialGap {
  /** STAY: closing back rent. MOVE: covering move-in costs in recovery mode. */
  mode: "STAY" | "MOVE";
  /** Total reported debt (STAY) or illustrative move budget (MOVE), never a legal payoff quote. */
  amountOwed: number;
  availableToday: number;
  nextPaycheckContribution: number;
  gapBeforeAssistance: number;
  sources: FundingSource[];
  totalEstimatedAssistance: number;
  remainingGap: number;
  /** Notes on assumptions the engine made. */
  assumptions: string[];
  confirmedHousingFunds: number;
  confirmedAssistance: number;
  confirmedRemainingGap: number;
  potentialSupport: {
    resourceId: string; name: string; status: ResourceStatus; amount: null;
    eligibility: ResourceMatch["eligibility"]; reasons: string[];
  }[];
  obligationIsEstimate: boolean;
  outstandingRentDebt: number;
}

export type CaseUpdateType =
  | "LANDLORD_ACCEPTED_PLAN"
  | "LANDLORD_REJECTED_PLAN"
  | "ASSISTANCE_APPLIED"
  | "ASSISTANCE_APPROVED"
  | "ASSISTANCE_DENIED"
  | "ASSISTANCE_WAITLISTED"
  | "LEGAL_AID_CONTACTED"
  | "COURT_DATE_SET"
  | "JUDGMENT_ENTERED"
  | "STAYING_NOT_REALISTIC"
  | "NEW_HOUSING_FOUND"
  | "PAYMENT_MADE";

export interface CaseUpdate {
  type: CaseUpdateType;
  note?: string;
  courtDate?: string;
  amountPaid?: number;
}
