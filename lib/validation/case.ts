import { z } from "zod";
import { intakeSchema } from "@/lib/intake/schema";
import { isISODate } from "@/lib/format";

export const dateSchema = z.string().refine(isISODate, "Use a valid YYYY-MM-DD date");
const cash = z.number().finite().min(0).max(1_000_000);
const identifier = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);

/** Full nested guest case validation. Computed status is always recalculated. */
export const userCaseSchema = z.object({
  ...intakeSchema.shape,
  id: identifier,
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
  state: z.literal("GA"),
  courtDate: dateSchema.optional(), nextPaycheckDate: dateSchema.optional(),
  county: z.enum(["Fulton", "DeKalb", "Cobb", "Gwinnett", "Clayton"]),
  caseNumber: z.string().max(100).optional(),
  paymentPlanAccepted: z.boolean().optional(), legalAidContacted: z.boolean().optional(),
  newHousingFound: z.boolean().optional(), stayingNotRealistic: z.boolean().optional(),
  housingBarrier: z.enum(["DEPOSIT_AND_FEES", "EVICTION_RECORD", "INCOME_TOO_LOW", "NEED_PLACE_TONIGHT", "MOVING_COSTS", "CHILDCARE_OR_FAMILY"]).optional(),
  nextPaycheckHousingAllocation: cash.optional(), maxAffordableToday: cash.optional(),
  essentialReserveToday: cash.optional(), maxAffordablePerPaycheck: cash.optional(), essentialReservePerPaycheck: cash.optional(),
  payIntervalDays: z.number().int().min(1).max(60).optional(),
  approvedAssistanceAmount: cash.optional(), approvedAssistanceAvailableDate: dateSchema.optional(),
  approvedAssistancePurpose: z.enum(["STAY", "MOVE"]).optional(),
  demoScenario: z.object({ simulated: z.literal(true), immediateAssistanceUnavailable: z.boolean(), label: z.string().min(1).max(200) }).strict().optional(),
  caseStatus: z.enum(["PREVENTION", "URGENT_INTERVENTION", "LEGAL_HELP_RECOMMENDED", "TRANSITION_RECOVERY"]),
  events: z.array(z.object({ id: identifier, type: z.string().min(1).max(80), description: z.string().max(2000), date: z.iso.datetime(), isUserAction: z.boolean() }).strict()).max(500),
  completedActionIds: z.array(identifier).max(100),
}).strict().superRefine((c, ctx) => {
  if (c.paymentPlanAccepted && c.paymentPlanRejected) ctx.addIssue({ code: "custom", path: ["paymentPlanAccepted"], message: "A plan cannot be both accepted and rejected." });
  if (c.nextPaycheckHousingAllocation !== undefined && c.nextPaycheckHousingAllocation > (c.nextPaycheckAmount ?? 0)) ctx.addIssue({ code: "custom", path: ["nextPaycheckHousingAllocation"], message: "Allocation exceeds paycheck." });
  if (c.approvedAssistanceAmount !== undefined && c.assistanceStatus !== "APPROVED") ctx.addIssue({ code: "custom", path: ["approvedAssistanceAmount"], message: "A confirmed award requires approval." });
});
