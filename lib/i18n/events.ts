import type { CaseEvent } from "@/types";
import { UPDATE_OPTIONS } from "@/lib/services/caseService";
import { createTranslator, type Locale } from "./core";

const labels: Record<string, string> = {
  INTAKE_COMPLETED: "Completed HomePath intake and built an action plan",
  LANDLORD_CONTACTED: "Contacted landlord (reported at intake)",
  ASSISTANCE_APPLIED: "Applied for rental assistance (reported at intake)",
  DOCUMENT_CONFIRMED: "Court document confirmed",
  STATUS_CHANGED: "Case status updated",
  BARRIER_SET: "Updated what's making housing hardest",
  DEMO_ASSISTANCE_UNAVAILABLE: "SIMULATION: modeled immediate assistance unavailable",
  ...Object.fromEntries(UPDATE_OPTIONS.map(o => [o.type, o.label])),
};

/** Never write translated history back to storage or try to translate arbitrary notes.
 * Exact known prefixes retain note suffixes verbatim. Ambiguous legacy records show
 * a translated event-type summary AND the complete original record for auditability.
 */
export function presentCaseEvent(event: CaseEvent, locale: Locale): { title: string; original?: string } {
  if (locale === "en") return { title: event.description };
  const tr = createTranslator(locale);
  const label = labels[event.type];
  if (!label) return { title: event.description };
  const candidates = [label,
    ...(event.type === "ASSISTANCE_APPLIED" ? ["Applied for rental assistance (reported at intake)"] : []),
  ];
  for (const prefix of candidates) {
    if (event.description === prefix) return { title: tr(prefix) };
    if (event.description.startsWith(prefix + " — ")) return { title: tr(prefix) + event.description.slice(prefix.length) };
  }
  return { title: tr(label), original: event.description };
}
