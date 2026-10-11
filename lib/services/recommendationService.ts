import type { ActionItem, ActionUrgency, UserCase } from "@/types";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";
import { effectiveStage } from "@/lib/engine/caseClassifier";
import { getCounty } from "@/lib/data/serviceArea";
import { calculateFinancialGap } from "@/lib/engine/resourceCombinationEngine";
import { RESOURCES } from "@/lib/data/resources";

// Deterministic action-plan generator. Every item carries a `reason` that
// explains exactly which facts about the case produced it. IDs are stable so
// completion state survives ordinary refreshes. Reclassification requires fresh review.

type Draft = Omit<ActionItem, "completed">;

const URGENCY_ORDER: Record<ActionUrgency, number> = { TODAY: 0, BEFORE_COURT: 1, THIS_WEEK: 2, ONGOING: 3 };

export const URGENCY_LABELS: Record<ActionUrgency, { title: string; subtitle: string }> = {
  TODAY: { title: "Today", subtitle: "The most time-sensitive steps" },
  BEFORE_COURT: { title: "Before your court date", subtitle: "Prepare so you're ready for the hearing" },
  THIS_WEEK: { title: "This week", subtitle: "Important steps to start in the next few days" },
  ONGOING: { title: "Ongoing", subtitle: "Steps that build stability over time" },
};

export function generateActionPlan(c: UserCase, now: Date = new Date()): ActionItem[] {
  const recovery = c.caseStatus === "TRANSITION_RECOVERY";
  const items = recovery ? recoveryActions(c, now) : stayActions(c, now);
  if (recovery) {
    const legalIds = new Set(["confirm-case-stage", "file-answer", "contact-legal-aid", "follow-up-legal-aid", "judgment-options", "prepare-hearing", "confirm-court-date"]);
    items.unshift(...stayActions(c, now).filter(i => legalIds.has(i.id)));
  }
  items.push({
    id: "keep-records",
    title: "Keep copies of everything",
    description: "Save every notice, court paper, receipt, and text or email with your landlord in one folder (photos on your phone count).",
    reason: "Written records protect you in court and make assistance applications faster.",
    urgency: "ONGOING",
  });

  const completed = new Set(c.completedActionIds ?? []);
  return items
    .map((i) => ({ ...i, completed: completed.has(i.id) }))
    .sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
}

function stayActions(c: UserCase, now: Date): Draft[] {
  const items: Draft[] = [];
  const stage = effectiveStage(c);
  const daysToCourt = daysUntil(c.courtDate, now);
  const courtUpcoming = daysToCourt !== null && daysToCourt >= 0;
  const filed = stage === "EVICTION_FILED" || stage === "COURT_DATE_SCHEDULED" || stage === "JUDGMENT_ENTERED";
  const urgent = filed || (courtUpcoming && daysToCourt! <= 14);
  const gap = calculateFinancialGap(c, RESOURCES, now);
  const county = getCounty(c.county);
  const courtPhrase =
    daysToCourt === null ? "" : daysToCourt < 0 ? "Your recorded court date has passed; confirm the outcome. " : daysToCourt === 0 ? "Your court date is today. " : `Your court date is in ${daysToCourt} days (${formatDate(c.courtDate)}). `;

  // ---- Legal
  if ((stage === "COURT_DATE_SCHEDULED" && daysToCourt === null) || (daysToCourt !== null && daysToCourt < 0 && filed)) {
    items.push({ id: "confirm-court-date", title: "Confirm your court date and case outcome", description: "Check the court record or call the clerk today. Ask legal aid about any deadline that may already be running.", reason: "The hearing date is missing, invalid, or has passed without a confirmed outcome.", urgency: "TODAY", href: county?.magistrateCourtUrl });
  }
  if (stage === "UNSURE") {
    items.push({
      id: "confirm-case-stage",
      title: "Find out where your case stands",
      description: `Call the ${c.county} County Magistrate Court or legal aid and ask if an eviction (dispossessory) case has been filed in your name.`,
      reason: "You weren't sure what stage you're in. Knowing whether a case is filed tells you which deadlines apply.",
      urgency: "TODAY",
      href: county?.magistrateCourtUrl,
    });
  }
  if (stage === "EVICTION_FILED") {
    items.push({
      id: "file-answer",
      title: "File your answer with the court",
      description:
        "Answer the eviction (dispossessory) papers in writing or in person at the magistrate court. Legal aid can help you write it.",
      reason:
        "An eviction has been filed and we don't have a court date. In Georgia, tenants generally have 7 days after being served to answer, or the landlord may win by default.",
      urgency: "TODAY",
      href: "/rights#answer",
    });
  }
  if (filed || (courtUpcoming && daysToCourt! <= 14) || stage === "UNSURE") {
    if (!c.legalAidContacted) {
      items.push({
        id: "contact-legal-aid",
        title: "Call free legal aid",
        description: "Contact Atlanta Legal Aid Society (404-524-5811) or another legal aid provider. Have your court papers ready.",
        reason: `${courtPhrase}${stage === "JUDGMENT_ENTERED" ? "A judgment was entered, and there may be a short window to act." : "A lawyer can check for defenses, errors in the filing, and options like a consent agreement."}`,
        urgency: "TODAY",
        href: "/resources?category=EVICTION_LEGAL_AID",
      });
    } else {
      items.push({
        id: "follow-up-legal-aid",
        title: "Follow up with legal aid",
        description: "Confirm whether they're representing you and what they need from you before the hearing.",
        reason: "You've contacted legal aid. Following up keeps your case from slipping through the cracks.",
        urgency: daysToCourt === 0 || stage === "JUDGMENT_ENTERED" || daysToCourt === null || (daysToCourt !== null && daysToCourt < 0) ? "TODAY" : courtUpcoming ? "BEFORE_COURT" : "THIS_WEEK",
      });
    }
  }
  if (stage === "JUDGMENT_ENTERED") {
    items.push({
      id: "judgment-options",
      title: "Ask about your options after the judgment",
      description: "Ask legal aid about appeal deadlines, paying to stay if allowed, or negotiating a move-out date with your landlord.",
      reason: "A judgment was entered. In Georgia, the window to appeal is short (generally 7 days), so act right away.",
      urgency: "TODAY",
      href: "/rights#writ",
    });
  }
  if (courtUpcoming) {
    items.push({
      id: "prepare-hearing",
      title: "Gather documents for your hearing",
      description: "Bring your lease, rent receipts, notices, photos of any repair problems, texts/emails with your landlord, and proof of any assistance applications.",
      reason: `${courtPhrase}Judges decide based on what's in front of them, so bring proof.`,
      urgency: daysToCourt === 0 ? "TODAY" : "BEFORE_COURT",
    });
    items.push({
      id: "attend-hearing",
      title: "Go to your hearing — arrive early",
      description: `Be at court on ${formatDate(c.courtDate)} at least 30 minutes early. Bring your payment plan and any assistance approval.`,
      reason: "Missing the hearing risks an adverse judgment; confirm attendance instructions with the court.",
      urgency: daysToCourt === 0 ? "TODAY" : "BEFORE_COURT",
      href: "/rights#hearing",
    });
  }

  // ---- Money: rental assistance
  const assistanceUrgency: ActionUrgency = urgent ? "TODAY" : "THIS_WEEK";
  const gapText =
    gap.confirmedRemainingGap > 0
      ? `After your reported, allocated housing funds${gap.nextPaycheckContribution ? " and your next paycheck" : ""}, you're about ${formatMoney(gap.confirmedRemainingGap)} short.`
      : "You may be able to cover what you owe with your own funds.";
  switch (c.assistanceStatus ?? (c.appliedForAssistance ? "WAITLISTED" : "NOT_ATTEMPTED")) {
    case "NOT_ATTEMPTED":
      if (gap.gapBeforeAssistance > 0) {
        items.push({
          id: "apply-assistance",
          title: "Apply for emergency rental assistance",
          description: "Apply to 2–3 programs at once — funding is limited and each program decides separately.",
          reason: `You haven't applied for assistance yet. ${gapText}`,
          urgency: assistanceUrgency,
          href: "/resources?category=RENTAL_ASSISTANCE",
        });
      }
      break;
    case "PENDING":
    case "WAITLISTED":
      items.push({
        id: "assistance-follow-up",
        title: "Follow up on your assistance application",
        description: "Call to confirm your application is complete, and apply to a second program while you wait.",
        reason: `Your application is pending or waitlisted. ${gapText}`,
        urgency: assistanceUrgency,
        href: "/resources?category=RENTAL_ASSISTANCE",
      });
      break;
    case "DENIED":
      items.push({
        id: "assistance-other-programs",
        title: "Try other assistance programs",
        description: "A denial from one program doesn't mean others will say no. Ask why you were denied, then apply to charities such as St. Vincent de Paul, and ask 211 about other current referrals.",
        reason: `Your application was denied. ${gapText}`,
        urgency: assistanceUrgency,
        href: "/resources?category=RENTAL_ASSISTANCE",
      });
      break;
    case "APPROVED":
      items.push({
        id: "share-approval",
        title: "Send your approval to your landlord",
        description: "Give your landlord (and the court, if a case is filed) a copy of your assistance approval letter.",
        reason: "Your assistance was approved. Confirm the amount, payment timing, and how it affects your case. An approval does not itself pause court deadlines.",
        urgency: "TODAY",
      });
      break;
  }

  // ---- Landlord
  if (c.paymentPlanAccepted) {
    items.push({
      id: "plan-in-writing",
      title: "Get the payment plan in writing",
      description: "Ask your landlord to confirm the plan in writing (email or text is OK), and if a case is filed, ask that it be dismissed or noted with the court.",
      reason: "Your landlord accepted a payment plan. A written agreement protects you if there's a dispute later.",
      urgency: "TODAY",
    });
  } else if (!c.contactedLandlord) {
    items.push({
      id: "contact-landlord",
      title: "Contact your landlord in writing",
      description: "Let them know you intend to pay, how much you can pay now, and that you're applying for assistance.",
      reason: "You haven't contacted your landlord yet. Many landlords prefer a plan over the cost and time of eviction.",
      urgency: urgent ? "TODAY" : "THIS_WEEK",
      href: "#payment-plan",
    });
  } else if (!c.paymentPlanDiscussed) {
    items.push({
      id: "propose-plan",
      title: "Propose a payment plan",
      description: "Use the payment plan calculator below to build a realistic schedule and draft a message to your landlord.",
      reason: `You've talked to your landlord but haven't discussed a plan. You have ${formatMoney(c.availableToday)} available today.`,
      urgency: urgent ? "TODAY" : "THIS_WEEK",
      href: "#payment-plan",
    });
  } else if (c.paymentPlanRejected) {
    items.push({
      id: "landlord-alternative",
      title: "Offer your landlord a different option",
      description: "Ask whether they would consider another arrangement within your safe budget or verified assistance funds. Keep it in writing and keep court deadlines.",
      reason: "Your landlord rejected a payment plan. Some landlords accept assistance funds even after declining a plan.",
      urgency: urgent ? "TODAY" : "THIS_WEEK",
      href: "#payment-plan",
    });
  }
  if (c.paymentPlanDiscussed && !c.canAffordPaymentPlan && !c.paymentPlanAccepted) {
    items.push({
      id: "right-size-plan",
      title: "Right-size your payment plan",
      description: "A plan you can't keep can make things worse. Use the calculator to build one around your actual paychecks.",
      reason: "You said the plan discussed isn't affordable for you.",
      urgency: "THIS_WEEK",
      href: "#payment-plan",
    });
  }

  // ---- Income and household
  if (c.employmentStatus === "UNEMPLOYED" || (c.incomeRecentlyReduced && !c.monthlyIncome)) {
    items.push({
      id: "file-unemployment",
      title: "File for unemployment benefits",
      description: "Contact the Georgia Department of Labor promptly to check eligibility, filing timing, and required work history.",
      reason: c.monthlyIncome ? "You're currently unemployed." : "You reported a loss of income and $0 current income.",
      urgency: "THIS_WEEK",
      href: "/employment",
    });
  }
  if (c.incomeRecentlyReduced) {
    items.push({
      id: "benefits-check",
      title: "Check benefits that free up money for rent",
      description: "SNAP (food), Medicaid/PeachCare, and utility help can lower monthly costs so more goes toward rent.",
      reason: "Your income recently dropped, which may make you newly eligible for benefits.",
      urgency: "ONGOING",
      href: "/resources?category=PUBLIC_BENEFITS",
    });
  }
  if (c.hasChildren) {
    items.push({
      id: "family-supports",
      title: "Apply for family supports",
      description: "Childcare subsidies (CAPS), WIC, and SNAP for your children can ease monthly costs.",
      reason: "You have children in your household; age, income, and other program rules still need to be checked.",
      urgency: "ONGOING",
      href: "/resources?category=CHILDCARE_FAMILY",
    });
  }
  items.push({
    id: "call-211",
    title: "Call 2-1-1 for programs open right now",
    description: "Ask United Way 2-1-1 for rent, utility, and food referrals, then confirm current intake directly with each provider.",
    reason: "Program funding changes; a referral is a starting point, not confirmation of funding.",
    urgency: "THIS_WEEK",
  });

  return items;
}

function recoveryActions(c: UserCase, now: Date): Draft[] {
  const items: Draft[] = [];
  const stage = effectiveStage(c);
  const daysToCourt = daysUntil(c.courtDate, now);
  const barrier = c.housingBarrier;

  if (c.newHousingFound) {
    items.push({
      id: "move-in-plan",
      title: "Plan your move-in",
      description: "Confirm your move-in date, set up utilities in your name, and ask about deposit help if you need it.",
      reason: "You found new housing — a smooth move-in protects your fresh start.",
      urgency: "TODAY",
    });
  } else {
    items.push({
      id: "safe-place",
      title: "Make sure you have a safe place to stay",
      description: "If you could be without housing soon, call 2-1-1 or Gateway Center to get on the path to shelter or temporary housing.",
      reason:
        barrier === "NEED_PLACE_TONIGHT"
          ? "You said you need somewhere to stay right now."
          : "Staying in your current home may not be possible, so it's important to know your backup options.",
      urgency: barrier === "NEED_PLACE_TONIGHT" || stage === "JUDGMENT_ENTERED" ? "TODAY" : "THIS_WEEK",
      href: "/housing",
    });
  }

  if (!c.newHousingFound && (stage === "JUDGMENT_ENTERED" || (daysToCourt !== null && daysToCourt >= 0) || stage === "EVICTION_FILED")) {
    items.push({
      id: "move-out-agreement",
      title: "Ask legal aid about a move-out agreement",
      description: "A negotiated move-out date — sometimes with the case dismissed — can give you more time and reduce the impact on your rental record.",
      reason:
        barrier === "EVICTION_RECORD"
          ? "You said an eviction record is your biggest worry, and an agreement may limit that."
          : "Your case is in court. How it ends can affect your ability to rent again.",
      urgency: "TODAY",
      href: "/resources?category=EVICTION_LEGAL_AID",
    });
  }
  if (daysToCourt !== null && daysToCourt >= 0) {
    items.push({
      id: "attend-hearing-recovery",
      title: "Still go to your court date",
      description: `Even if you plan to move, attend on ${formatDate(c.courtDate)}. You may be able to ask for more time to move.`,
      reason: "Missing court risks an adverse judgment even while you plan a move.",
      urgency: daysToCourt === 0 ? "TODAY" : "BEFORE_COURT",
      href: "/rights#hearing",
    });
  }

  if (!c.newHousingFound) {
    items.push({
      id: "housing-search",
      title: "Start your affordable housing search",
      description: "Set your budget and preferred area, then contact listings and housing authorities with open waitlists.",
      reason: barrier === "INCOME_TOO_LOW" ? "You said income is the hardest part — income-based housing is a strong fit." : "Starting early gives you more choices.",
      urgency: barrier === "INCOME_TOO_LOW" ? "TODAY" : "THIS_WEEK",
      href: "/housing",
    });
  }
  items.push({
    id: "deposit-help",
    title: "Ask for deposit and move-in help",
    description: "Rapid re-housing and deposit programs can cover a security deposit, application fees, or first month's rent.",
    reason:
      barrier === "DEPOSIT_AND_FEES"
        ? "You said deposits and fees are the hardest part."
        : "Move-in costs are often the biggest barrier to a new place.",
    urgency: barrier === "DEPOSIT_AND_FEES" ? "TODAY" : "THIS_WEEK",
    href: "/resources?category=SECURITY_DEPOSIT_ASSISTANCE",
  });
  items.push({
    id: "moving-help",
    title: "Line up moving and furniture help",
    description: "Ask about free furniture programs, and plan where your belongings will go if there's a gap between homes.",
    reason: barrier === "MOVING_COSTS" ? "You said moving costs are the hardest part." : "Planning the move early avoids losing belongings.",
    urgency: barrier === "MOVING_COSTS" ? "TODAY" : "THIS_WEEK",
    href: "/resources?category=MOVING_ASSISTANCE",
  });
  items.push({
    id: "employment-recovery",
    title: "Strengthen your income",
    description: "Career centers offer job-search support and training referrals. Ask about costs, eligibility, and any paid opportunities.",
    reason:
      barrier === "INCOME_TOO_LOW"
        ? "You said income is the hardest part."
        : c.incomeRecentlyReduced
          ? "Your income recently dropped. Rebuilding it makes your next home more stable."
          : "Higher income opens up more housing options.",
    urgency: barrier === "INCOME_TOO_LOW" ? "THIS_WEEK" : "ONGOING",
    href: "/employment",
  });
  items.push({
    id: "benefits-recovery",
    title: "Lock in benefits during the transition",
    description: "SNAP, Medicaid, and food assistance may reduce costs if you qualify. Update your address with each program.",
    reason: "Benefits keep basics covered while your housing changes.",
    urgency: "ONGOING",
    href: "/resources?category=PUBLIC_BENEFITS",
  });
  if (c.hasChildren) {
    items.push({
      id: "children-stability",
      title: "Keep your children's school and care stable",
      description: "Ask your school's homeless liaison (McKinney-Vento) about staying in the same school and transportation, and look into CAPS childcare help.",
      reason:
        barrier === "CHILDCARE_OR_FAMILY"
          ? "You said childcare and family needs are the hardest part."
          : "You have children. Ask the school liaison whether your living situation qualifies for McKinney-Vento protections and school-stability support.",
      urgency: barrier === "CHILDCARE_OR_FAMILY" ? "TODAY" : "THIS_WEEK",
      href: "/resources?category=CHILDCARE_FAMILY",
    });
  }
  return items;
}
