import "server-only";
import type { UserCase } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase";
import { generateActionPlan } from "./recommendationService";

// Server-only Supabase persistence. Returns false (and does nothing) when
// Supabase isn't configured — guest mode then relies on localStorage alone.

export async function persistCase(sessionId: string, c: UserCase): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase.from("user_cases").upsert({
    id: c.id,
    session_id: sessionId,
    zip_code: c.zipCode,
    county: c.county,
    state: c.state,
    monthly_rent: c.monthlyRent,
    amount_owed: c.amountOwed,
    available_today: c.availableToday,
    monthly_income: c.monthlyIncome,
    next_paycheck_amount: c.nextPaycheckAmount ?? null,
    next_paycheck_date: c.nextPaycheckDate ?? null,
    household_size: c.householdSize,
    has_children: c.hasChildren,
    employment_status: c.employmentStatus,
    income_recently_reduced: c.incomeRecentlyReduced,
    contacted_landlord: c.contactedLandlord,
    payment_plan_discussed: c.paymentPlanDiscussed,
    payment_plan_rejected: c.paymentPlanRejected,
    payment_plan_accepted: c.paymentPlanAccepted ?? false,
    can_afford_payment_plan: c.canAffordPaymentPlan,
    applied_for_assistance: c.appliedForAssistance,
    assistance_status: c.assistanceStatus ?? null,
    eviction_stage: c.evictionStage,
    court_date: c.courtDate ?? null,
    case_number: c.caseNumber ?? null,
    legal_aid_contacted: c.legalAidContacted ?? false,
    new_housing_found: c.newHousingFound ?? false,
    staying_not_realistic: c.stayingNotRealistic ?? false,
    housing_barrier: c.housingBarrier ?? null,
    case_status: c.caseStatus,
    raw: c,
    updated_at: c.updatedAt,
  });
  if (error) {
    console.warn("[case] Supabase upsert failed:", error.message);
    return false;
  }

  if (c.events.length) {
    await supabase.from("case_events").upsert(
      c.events.map((e) => ({
        id: e.id,
        case_id: c.id,
        type: e.type,
        description: e.description,
        event_date: e.date,
        is_user_action: e.isUserAction,
      })),
    );
  }

  // Replace the stored action plan with the freshly generated one.
  const actions = generateActionPlan(c);
  await supabase.from("action_items").delete().eq("case_id", c.id);
  await supabase.from("action_items").insert(
    actions.map((a) => ({
      id: a.id,
      case_id: c.id,
      title: a.title,
      description: a.description,
      reason: a.reason,
      urgency: a.urgency,
      completed: a.completed,
    })),
  );
  return true;
}
