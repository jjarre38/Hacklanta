import type { PaymentInstallment } from "@/types";
import { formatDate } from "@/lib/format";
import { localeTag, type Locale } from "./core";

export interface TemplateFacts {
  totalOwed: number;
  installments: PaymentInstallment[];
  tenantName?: string;
  landlordName?: string;
}
/** Deterministic, offline text. User names remain verbatim; cents and dates are preserved. */
export function landlordTemplate(facts: TemplateFacts, locale: Locale) {
  const money = (n: number) => new Intl.NumberFormat(localeTag(locale), { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const schedule = facts.installments.filter(i => i.amount > 0).map(i => `• ${money(i.amount)} — ${formatDate(i.dueDate, undefined, locale)}`).join("\n");
  const remaining = Math.max(0, Math.round((facts.totalOwed - facts.installments.reduce((sum, i) => sum + i.amount, 0)) * 100) / 100);
  if (locale === "es") return {
    subject: "Propuesta de plan de pagos del alquiler",
    message: `Hola ${facts.landlordName || "[Nombre del arrendador]"}:\n\nQuisiera proponer el siguiente calendario para el alquiler pendiente de ${money(facts.totalOwed)}:\n\n${schedule}\n\n${remaining > 0 ? `Esta propuesta cubre solo parte de la deuda; quedarían ${money(remaining)} sin asignar.\n\n` : ""}Por favor, confirme por escrito si acepta esta propuesta. Podemos conversar sobre los detalles.\n\nGracias,\n${facts.tenantName || "[Tu nombre]"}`,
  };
  return {
    subject: "Proposed rent payment plan",
    message: `Hello ${facts.landlordName || "[Landlord Name]"},\n\nI would like to propose the following schedule for my outstanding rent of ${money(facts.totalOwed)}:\n\n${schedule}\n\n${remaining > 0 ? `This proposal covers only part of the debt; ${money(remaining)} would remain unallocated.\n\n` : ""}Please confirm in writing if you agree to this proposal. I am available to discuss the details.\n\nThank you,\n${facts.tenantName || "[Your Name]"}`,
  };
}
