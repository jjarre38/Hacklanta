import { z } from "zod";
import { isISODate } from "@/lib/format";
import { SUPPORTED_COUNTY_NAMES } from "@/lib/data/serviceArea";

// Shared intake validation (client form + /api/case). No transforms, so the
// input and output types are identical.

const money = (label: string) =>
  z.number({ error: `Enter ${label} (use 0 if none)` }).min(0, "Can't be negative").max(1_000_000, "That looks too large");

const optionalMoney = z.number().min(0, "Can't be negative").max(1_000_000).optional();
const isoDate = z.string().refine(isISODate, "Choose a valid date");

export const EVICTION_STAGES = [
  "BEHIND_ON_RENT",
  "NOTICE_RECEIVED",
  "EVICTION_FILED",
  "COURT_DATE_SCHEDULED",
  "JUDGMENT_ENTERED",
  "UNSURE",
] as const;

export const EMPLOYMENT_STATUSES = [
  "EMPLOYED_FULL_TIME",
  "EMPLOYED_PART_TIME",
  "SELF_EMPLOYED",
  "UNEMPLOYED",
  "UNABLE_TO_WORK",
  "RETIRED",
] as const;

export const intakeSchema = z
  .object({
    // Location
    zipCode: z.string().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
    county: z.string().min(1, "Choose your county"),
    // Financial
    monthlyRent: money("your monthly rent").refine((n) => n > 0, "Enter your monthly rent"),
    amountOwed: money("how much you owe"),
    availableToday: money("how much you have today"),
    monthlyIncome: money("your monthly income"),
    nextPaycheckAmount: optionalMoney,
    nextPaycheckDate: isoDate.optional(),
    // Household
    householdSize: z.number({ error: "Enter household size" }).int().min(1, "At least 1").max(20),
    hasChildren: z.boolean({ error: "Choose yes or no" }),
    employmentStatus: z.enum(EMPLOYMENT_STATUSES, { error: "Choose one" }),
    incomeRecentlyReduced: z.boolean({ error: "Choose yes or no" }),
    // Landlord
    landlordName: z.string().max(120).optional(),
    contactedLandlord: z.boolean({ error: "Choose yes or no" }),
    paymentPlanDiscussed: z.boolean(),
    paymentPlanRejected: z.boolean(),
    canAffordPaymentPlan: z.boolean({ error: "Choose yes or no" }),
    // Assistance
    appliedForAssistance: z.boolean({ error: "Choose yes or no" }),
    assistanceStatus: z.enum(["APPROVED", "DENIED", "WAITLISTED", "NOT_ATTEMPTED", "PENDING"]).optional(),
    // Eviction stage
    evictionStage: z.enum(EVICTION_STAGES, { error: "Choose the option closest to your situation" }),
    courtDate: isoDate.optional(),
  })
  .superRefine((v, ctx) => {
    for (const issue of conditionalIssues(v)) ctx.addIssue({ code: "custom", path: [issue.path], message: issue.message });
  });

export type IntakeValues = z.infer<typeof intakeSchema>;

/**
 * Cross-field rules. Kept separate from the schema so the wizard can check them
 * per step (zod skips object refinements while other fields are still empty).
 */
export function conditionalIssues(v: Partial<IntakeValues>): { path: keyof IntakeValues; message: string }[] {
  const issues: { path: keyof IntakeValues; message: string }[] = [];
  if (v.evictionStage === "COURT_DATE_SCHEDULED" && !v.courtDate) {
    issues.push({ path: "courtDate", message: "Enter your court date (check your court papers)" });
  }
  if (v.appliedForAssistance && !v.assistanceStatus) {
    issues.push({ path: "assistanceStatus", message: "Choose what happened with your application" });
  }
  if (v.county && !SUPPORTED_COUNTY_NAMES.includes(v.county)) {
    issues.push({ path: "county", message: "HomePath currently supports Metro Atlanta counties only" });
  }
  return issues;
}

export const STAGE_OPTIONS: { value: (typeof EVICTION_STAGES)[number]; label: string; hint: string }[] = [
  { value: "BEHIND_ON_RENT", label: "I'm behind on rent", hint: "No written notice or court papers yet" },
  { value: "NOTICE_RECEIVED", label: "I got a notice from my landlord", hint: "Like a demand for payment or to move out" },
  { value: "EVICTION_FILED", label: "I was served court papers", hint: "A dispossessory (eviction) case was filed, but no hearing date yet" },
  { value: "COURT_DATE_SCHEDULED", label: "I have a court date", hint: "A hearing is scheduled" },
  { value: "JUDGMENT_ENTERED", label: "The court ruled against me", hint: "A judgment or writ of possession was issued" },
  { value: "UNSURE", label: "I'm not sure", hint: "That's okay — we'll help you find out" },
];

export const EMPLOYMENT_OPTIONS: { value: (typeof EMPLOYMENT_STATUSES)[number]; label: string }[] = [
  { value: "EMPLOYED_FULL_TIME", label: "Working full-time" },
  { value: "EMPLOYED_PART_TIME", label: "Working part-time" },
  { value: "SELF_EMPLOYED", label: "Self-employed / gig work" },
  { value: "UNEMPLOYED", label: "Not working right now" },
  { value: "UNABLE_TO_WORK", label: "Unable to work (disability or health)" },
  { value: "RETIRED", label: "Retired" },
];
