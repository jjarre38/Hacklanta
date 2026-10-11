import { createTranslator, type Locale } from "@/lib/i18n/core";
import type { ResourceCategory, UserCase } from "@/types";
import { daysUntil, formatMoney } from "@/lib/format";

// Deterministic guidance for the affordable housing search. Pure function.

export interface HousingPreferences {
  maxRent: number;
  bedrooms: number;
  county: string;
  moveInDate?: string;
  needsTransit: boolean;
}

export interface HousingGuidance {
  /** Categories to show, in priority order. */
  categories: ResourceCategory[];
  tips: string[];
  affordableRent: number | null;
  urgent: boolean;
}

export function housingGuidance(prefs: HousingPreferences, userCase: UserCase | null, now: Date = new Date(), locale: Locale = "en"): HousingGuidance {
  const tr = createTranslator(locale);
  const tips: string[] = [];
  const income = userCase?.monthlyIncome ?? 0;
  // Common affordability rule of thumb: rent at or below ~30% of income.
  const affordableRent = income > 0 ? Math.round((income * 0.3) / 10) * 10 : null;

  if (affordableRent !== null) {
    if (prefs.maxRent > affordableRent) {
      tips.push(
        tr("Your budget of {0} is above ~30% of your monthly income ({1}). Income-based housing or a voucher may make rent more sustainable.", { 0: formatMoney(prefs.maxRent, locale), 1: formatMoney(affordableRent, locale) }),
      );
    } else {
      tips.push(tr("A rent of {0} is within ~30% of your income — a rough benchmark only. Check utilities, transportation, childcare, debts, and other essentials before choosing a rent.", { 0: formatMoney(prefs.maxRent, locale) }));
    }
  }

  const days = daysUntil(prefs.moveInDate, now);
  const urgent = days !== null && days <= 14;
  if (urgent) {
    tips.push(tr("Your move-in date is within two weeks. Line up temporary housing as a backup while you search, and ask about deposit help now."));
  }
  if (prefs.needsTransit) {
    tips.push(tr("You need transit access: search near MARTA rail or bus lines, and check Cobb Link, Ride Gwinnett, or Xpress routes outside the city."));
  }
  if (prefs.bedrooms >= 3) {
    tips.push(tr("Larger units have fewer listings. Housing authority waitlists and family-focused programs may open more options."));
  }
  if (userCase?.housingBarrier === "EVICTION_RECORD" || userCase?.evictionStage === "JUDGMENT_ENTERED") {
    tips.push(tr("Some landlords consider an eviction record. Ask legal aid about a dismissal or agreement, and look for second-chance or income-based properties."));
  }
  tips.push(tr("On GeorgiaHousingSearch.org, filter by your rent limit, bedrooms, and whether landlords accept Housing Choice Vouchers."));

  const base: ResourceCategory[] = ["AFFORDABLE_HOUSING", "SECURITY_DEPOSIT_ASSISTANCE", "TEMPORARY_HOUSING", "MOVING_ASSISTANCE", "EMERGENCY_SHELTER"];
  let categories: ResourceCategory[] = urgent
    ? ["TEMPORARY_HOUSING", "EMERGENCY_SHELTER", "SECURITY_DEPOSIT_ASSISTANCE", "AFFORDABLE_HOUSING", "MOVING_ASSISTANCE"]
    : base;
  // Whatever the user said is hardest goes first.
  const barrierFirst: Partial<Record<NonNullable<UserCase["housingBarrier"]>, ResourceCategory>> = {
    DEPOSIT_AND_FEES: "SECURITY_DEPOSIT_ASSISTANCE",
    NEED_PLACE_TONIGHT: "EMERGENCY_SHELTER",
    MOVING_COSTS: "MOVING_ASSISTANCE",
  };
  const first = userCase?.housingBarrier ? barrierFirst[userCase.housingBarrier] : undefined;
  if (first) categories = [first, ...categories.filter((c) => c !== first)];

  return { categories, tips, affordableRent, urgent };
}
