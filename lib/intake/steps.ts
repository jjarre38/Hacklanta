import type { IntakeValues } from "./schema";

// Intake step definitions. Each step is one small group of questions; the
// `fields` list drives per-step validation. Conditional questions inside a
// step are controlled by the `show*` helpers below.

export type StepId = "location" | "rent" | "money" | "household" | "work" | "landlord" | "assistance" | "stage";

export interface IntakeStep {
  id: StepId;
  group: "Location" | "Financial" | "Household" | "Landlord" | "Assistance" | "Eviction Stage";
  title: string;
  subtitle: string;
  fields: (keyof IntakeValues)[];
}

export const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "location",
    group: "Location",
    title: "Where do you live?",
    subtitle: "Help is local, so we start with your ZIP code.",
    fields: ["zipCode", "county"],
  },
  {
    id: "rent",
    group: "Financial",
    title: "Let's look at your rent",
    subtitle: "Rough numbers are fine. You can update them later.",
    fields: ["monthlyRent", "amountOwed"],
  },
  {
    id: "money",
    group: "Financial",
    title: "What money do you have coming in?",
    subtitle: "This helps us build a payment plan you can actually keep.",
    fields: ["availableToday", "monthlyIncome", "nextPaycheckAmount", "nextPaycheckDate"],
  },
  {
    id: "household",
    group: "Household",
    title: "Who lives with you?",
    subtitle: "Some programs prioritize families with children.",
    fields: ["householdSize", "hasChildren"],
  },
  {
    id: "work",
    group: "Household",
    title: "Tell us about work",
    subtitle: "A recent drop in income can open up more help.",
    fields: ["employmentStatus", "incomeRecentlyReduced"],
  },
  {
    id: "landlord",
    group: "Landlord",
    title: "Have you talked with your landlord?",
    subtitle: "There's no wrong answer — many people haven't yet.",
    fields: ["landlordName", "contactedLandlord", "paymentPlanDiscussed", "paymentPlanRejected", "canAffordPaymentPlan"],
  },
  {
    id: "assistance",
    group: "Assistance",
    title: "Have you applied for rental assistance?",
    subtitle: "Programs like county emergency funds, charities, or 2-1-1 referrals.",
    fields: ["appliedForAssistance", "assistanceStatus"],
  },
  {
    id: "stage",
    group: "Eviction Stage",
    title: "Where are things right now?",
    subtitle: "Choose what's closest. This shapes how urgent your plan is.",
    fields: ["evictionStage", "courtDate"],
  },
];

export const showPaymentPlanDiscussed = (v: Partial<IntakeValues>) => v.contactedLandlord === true;
export const showPaymentPlanRejected = (v: Partial<IntakeValues>) => v.contactedLandlord === true && v.paymentPlanDiscussed === true;
export const showAssistanceStatus = (v: Partial<IntakeValues>) => v.appliedForAssistance === true;
export const showCourtDate = (v: Partial<IntakeValues>) => v.evictionStage === "COURT_DATE_SCHEDULED";
