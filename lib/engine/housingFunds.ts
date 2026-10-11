import type { UserCase } from "@/types";
import { daysUntil } from "@/lib/format";

export const money = (n: number | undefined): number => Number.isFinite(n) ? Math.max(0, Math.round((n! + Number.EPSILON) * 100) / 100) : 0;
/** Monetary limits round down so fractional-cent input cannot exceed a stated cap. */
export const moneyLimit = (n: number | undefined): number => Number.isFinite(n) ? Math.max(0, Math.floor(n! * 100 + 1e-8) / 100) : 0;
export const housingCash = (c: UserCase): number => moneyLimit(Math.min(moneyLimit(c.availableToday), moneyLimit(c.maxAffordableToday ?? c.availableToday), Math.max(0, moneyLimit(c.availableToday) - money(c.essentialReserveToday))));

export function fundsArriveInTime(c: UserCase, date: string | undefined, mode: "STAY" | "MOVE", now: Date): boolean {
  const days = daysUntil(date, now);
  const court = mode === "STAY" ? daysUntil(c.courtDate, now) : null;
  return days !== null && days >= 0 && (court === null || days <= court);
}

export function allocatedPaycheck(c: UserCase, mode: "STAY" | "MOVE", now: Date): number {
  if (!fundsArriveInTime(c, c.nextPaycheckDate, mode, now)) return 0;
  return moneyLimit(Math.min(moneyLimit(c.nextPaycheckHousingAllocation), moneyLimit(c.nextPaycheckAmount), Math.max(0, moneyLimit(c.nextPaycheckAmount) - money(c.essentialReservePerPaycheck))));
}
