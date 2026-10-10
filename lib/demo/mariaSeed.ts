import type { IntakeValues } from "@/lib/intake/schema";
import { addDays, toISODate } from "@/lib/format";

// Maria — the hackathon demo persona. Dates are relative to "now" so the demo
// always shows a court date 7 days away.
//
// Fulton County (ZIP 30310), $1,250/mo rent, $1,400 owed, $500 available today,
// $450 next paycheck, 1 adult + 2 children, employed with reduced hours,
// court date in 7 days, hasn't talked to her landlord or applied for help.

export function mariaIntake(now: Date = new Date()): IntakeValues {
  return {
    zipCode: "30310",
    county: "Fulton",
    monthlyRent: 1250,
    amountOwed: 1400,
    availableToday: 500,
    monthlyIncome: 1950,
    nextPaycheckAmount: 450,
    nextPaycheckDate: toISODate(addDays(now, 3)),
    householdSize: 3,
    hasChildren: true,
    employmentStatus: "EMPLOYED_FULL_TIME",
    incomeRecentlyReduced: true,
    landlordName: "Westview Commons Apartments",
    contactedLandlord: false,
    paymentPlanDiscussed: false,
    paymentPlanRejected: false,
    canAffordPaymentPlan: true,
    appliedForAssistance: false,
    assistanceStatus: undefined,
    evictionStage: "COURT_DATE_SCHEDULED",
    courtDate: toISODate(addDays(now, 7)),
  };
}

export const MARIA_NAME = "Maria";
