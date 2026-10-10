import type { CaseEvent, CaseUpdate, CaseUpdateType, ExtractedDocument, UserCase } from "@/types";
import { classifyCase, STAGE_ORDER, STATUS_META } from "@/lib/engine/caseClassifier";
import { formatDate, formatMoney, makeId } from "@/lib/format";
import { getCounty, SERVICE_STATE } from "@/lib/data/serviceArea";

// Pure case lifecycle functions: create from intake, apply updates, reclassify.
// Storage lives elsewhere (lib/client/caseStore.ts and app/api/case/route.ts).

export type IntakeData = Omit<UserCase, "id" | "createdAt" | "updatedAt" | "caseStatus" | "events" | "completedActionIds" | "state"> & {
  state?: string;
};

export function createCaseFromIntake(data: IntakeData, now: Date = new Date(), id: string = makeId("case")): UserCase {
  const iso = now.toISOString();
  const events: CaseEvent[] = [
    { id: makeId("evt"), type: "INTAKE_COMPLETED", description: "Completed HomePath intake and built an action plan", date: iso, isUserAction: true },
  ];
  if (data.contactedLandlord) {
    events.push({ id: makeId("evt"), type: "LANDLORD_CONTACTED", description: "Contacted landlord (reported at intake)", date: iso, isUserAction: true });
  }
  if (data.appliedForAssistance) {
    events.push({ id: makeId("evt"), type: "ASSISTANCE_APPLIED", description: "Applied for rental assistance (reported at intake)", date: iso, isUserAction: true });
  }

  const draft: UserCase = {
    ...data,
    state: data.state ?? SERVICE_STATE,
    assistanceStatus: data.appliedForAssistance ? data.assistanceStatus ?? "WAITLISTED" : "NOT_ATTEMPTED",
    id,
    createdAt: iso,
    updatedAt: iso,
    caseStatus: "PREVENTION",
    events,
    completedActionIds: [],
  };
  return { ...draft, caseStatus: classifyCase(draft, now).status };
}

/** Recompute caseStatus and log a status-change event if it changed. */
export function reclassify(c: UserCase, now: Date = new Date()): UserCase {
  const { status } = classifyCase(c, now);
  if (status === c.caseStatus) return c;
  return {
    ...c,
    caseStatus: status,
    events: [
      ...c.events,
      {
        id: makeId("evt"),
        type: "STATUS_CHANGED",
        description: `Case status changed to ${STATUS_META[status].label}`,
        date: now.toISOString(),
        isUserAction: false,
      },
    ],
  };
}

export const UPDATE_OPTIONS: { type: CaseUpdateType; label: string; group: "Landlord" | "Assistance" | "Legal" | "Housing" }[] = [
  { type: "LANDLORD_ACCEPTED_PLAN", label: "Landlord accepted my payment plan", group: "Landlord" },
  { type: "LANDLORD_REJECTED_PLAN", label: "Landlord rejected my payment plan", group: "Landlord" },
  { type: "PAYMENT_MADE", label: "I made a payment", group: "Landlord" },
  { type: "ASSISTANCE_APPLIED", label: "I applied for rental assistance", group: "Assistance" },
  { type: "ASSISTANCE_APPROVED", label: "Rental assistance was approved", group: "Assistance" },
  { type: "ASSISTANCE_DENIED", label: "Rental assistance was denied / unavailable", group: "Assistance" },
  { type: "ASSISTANCE_WAITLISTED", label: "I was waitlisted for assistance", group: "Assistance" },
  { type: "LEGAL_AID_CONTACTED", label: "I contacted legal aid", group: "Legal" },
  { type: "COURT_DATE_SET", label: "I received a court date", group: "Legal" },
  { type: "JUDGMENT_ENTERED", label: "A judgment was entered", group: "Legal" },
  { type: "STAYING_NOT_REALISTIC", label: "Staying here isn't realistic anymore", group: "Housing" },
  { type: "NEW_HOUSING_FOUND", label: "I found new housing", group: "Housing" },
];

/** Apply a user-reported update, log it, and reclassify. Pure. */
export function applyCaseUpdate(c: UserCase, update: CaseUpdate, now: Date = new Date()): UserCase {
  let next: UserCase = { ...c };
  let description = UPDATE_OPTIONS.find((o) => o.type === update.type)?.label ?? update.type;

  switch (update.type) {
    case "LANDLORD_ACCEPTED_PLAN":
      next = { ...next, contactedLandlord: true, paymentPlanDiscussed: true, paymentPlanAccepted: true, paymentPlanRejected: false };
      break;
    case "LANDLORD_REJECTED_PLAN":
      next = { ...next, contactedLandlord: true, paymentPlanDiscussed: true, paymentPlanRejected: true, paymentPlanAccepted: false };
      break;
    case "PAYMENT_MADE": {
      const paid = Math.max(0, update.amountPaid ?? 0);
      next = {
        ...next,
        amountOwed: Math.max(0, next.amountOwed - paid),
        availableToday: Math.max(0, next.availableToday - paid),
      };
      description = `Paid ${formatMoney(paid)} toward rent`;
      break;
    }
    case "ASSISTANCE_APPLIED":
      next = { ...next, appliedForAssistance: true, assistanceStatus: "WAITLISTED" };
      break;
    case "ASSISTANCE_APPROVED":
      next = { ...next, appliedForAssistance: true, assistanceStatus: "APPROVED" };
      break;
    case "ASSISTANCE_DENIED":
      next = { ...next, appliedForAssistance: true, assistanceStatus: "DENIED" };
      break;
    case "ASSISTANCE_WAITLISTED":
      next = { ...next, appliedForAssistance: true, assistanceStatus: "WAITLISTED" };
      break;
    case "LEGAL_AID_CONTACTED":
      next = { ...next, legalAidContacted: true };
      break;
    case "COURT_DATE_SET":
      if (update.courtDate) {
        next = {
          ...next,
          courtDate: update.courtDate,
          evictionStage: next.evictionStage === "JUDGMENT_ENTERED" ? next.evictionStage : "COURT_DATE_SCHEDULED",
        };
        description = `Court date set for ${formatDate(update.courtDate)}`;
      }
      break;
    case "JUDGMENT_ENTERED":
      next = { ...next, evictionStage: "JUDGMENT_ENTERED" };
      break;
    case "STAYING_NOT_REALISTIC":
      next = { ...next, stayingNotRealistic: true };
      break;
    case "NEW_HOUSING_FOUND":
      next = { ...next, newHousingFound: true };
      break;
  }

  if (update.note) description += ` — ${update.note}`;
  next.events = [...c.events, { id: makeId("evt"), type: update.type, description, date: now.toISOString(), isUserAction: true }];
  next.updatedAt = now.toISOString();
  return reclassify(next, now);
}

export function toggleActionCompleted(c: UserCase, actionId: string): UserCase {
  const set = new Set(c.completedActionIds);
  if (set.has(actionId)) set.delete(actionId);
  else set.add(actionId);
  return { ...c, completedActionIds: Array.from(set), updatedAt: new Date().toISOString() };
}

/** Apply user-confirmed fields from an uploaded document. Pure. */
export function applyExtractedDocument(c: UserCase, doc: ExtractedDocument, now: Date = new Date()): UserCase {
  const next: UserCase = { ...c };
  const changes: string[] = [];

  if (doc.amountClaimed != null && doc.amountClaimed !== c.amountOwed) {
    next.amountOwed = doc.amountClaimed;
    changes.push(`amount owed ${formatMoney(doc.amountClaimed)}`);
  }
  if (doc.courtDate && doc.courtDate !== c.courtDate) {
    next.courtDate = doc.courtDate;
    if (STAGE_ORDER[next.evictionStage] < STAGE_ORDER.COURT_DATE_SCHEDULED) next.evictionStage = "COURT_DATE_SCHEDULED";
    changes.push(`court date ${formatDate(doc.courtDate)}`);
  } else if (doc.caseNumber && STAGE_ORDER[next.evictionStage] < STAGE_ORDER.EVICTION_FILED) {
    // A court case number means a case has been filed.
    next.evictionStage = "EVICTION_FILED";
    changes.push("eviction filed");
  }
  if (doc.caseNumber) next.caseNumber = doc.caseNumber;
  if (doc.landlordName) next.landlordName = doc.landlordName;
  const county = doc.county ? getCounty(doc.county)?.name : undefined;
  if (county && county !== c.county) {
    next.county = county;
    changes.push(`${county} County`);
  }

  next.events = [
    ...c.events,
    {
      id: makeId("evt"),
      type: "DOCUMENT_CONFIRMED",
      description: `Uploaded a court document${doc.caseNumber ? ` (case ${doc.caseNumber})` : ""}${changes.length ? ` — updated ${changes.join(", ")}` : ""}`,
      date: now.toISOString(),
      isUserAction: true,
    },
  ];
  next.updatedAt = now.toISOString();
  return reclassify(next, now);
}
