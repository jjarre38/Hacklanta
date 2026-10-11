# HomePath UI integration handoff

Backend branch: `codex/homepath-reliability`. No visual page, component, layout, CSS, or Tailwind file was edited. Existing prop/function names are preserved where practical. The following integration work belongs to the UI teammate.

## Release blockers — not resolved by this document

1. **Demo wiring:** `app/dashboard/DashboardClient.tsx` currently uses `ASSISTANCE_DENIED` for both the simulated assistance button and delayed full-transition callback. That now correctly means one denied application and does **not** transition. Wire the explicit functions below before presenting the visual transition. The current delayed callback also risks reading an old case from its closure.
2. **Money display:** `components/resources/ResourceCombinationPanel.tsx` still says “After programs,” “Covered,” and “Program amounts are demo estimates.” Replace with “Remaining gap from reported housing funds”; a zero gap is “Reported funds cover this estimate,” never a promise of payment or housing. Include known approved assistance as its own segment, display allocation assumptions, and keep unknown opportunities outside the money bar. The backend prevents uncertain funding from closing the gap, but the old labels and chart omit the new confirmed-assistance segment.
3. **Payment proposal:** `components/paymentplan/PaymentPlanCalculator.tsx` must show `affordability`, `unallocatedBalance`, and `assumptions`. Maria's plan is **Illustrative — edit after essential expenses**. `feasible` means only that scheduled dollars equal the entered debt; it does not certify affordability or landlord acceptance. Editing installments must revalidate caps, totals, cents, dates, and remaining balance, rather than retaining stale computed flags. Refresh/reset the proposal when the case changes.
4. **Guest privacy:** `lib/copy.ts` currently says “for this session.” localStorage survives tab/browser closure. Required wording: “Your saved case stays in this browser until you clear it. Anyone using this browser profile may be able to see it. HomePath does not save guest cases or documents to its server.” No autosync now occurs. Intake still sends answers to the case API for in-memory computation; do not claim answers never leave the device. `clearCase()` removes case and guest session keys. Historical cloud records, if any, require separate operator cleanup.
5. **Document/AI claims:** The sample returns seeded fields with `demo: true`, `simulated: true`, `processing: "SEEDED_SAMPLE_NO_AI"`; label it “Fictional sample — seeded extraction preview.” Do not say Claude read it. Real AI calls are disabled for ordinary guest browsers even if an Anthropic key exists. Show a manual-entry path. Do not expose the operator token to the browser. Any future authorized upload flow must explain Anthropic processing and collect `consentToAIProcessing` before transmitting a real file.

## Exact demo integration

Use imports from `@/lib/demo/mariaSeed`:

```ts
import { resetMaria, runMariaTransition, simulateMariaAssistanceUnavailable } from "@/lib/demo/mariaSeed";
import { applyCaseUpdate } from "@/lib/services/caseService";

// Pass the result to the existing case update/persistence hook.
update(applyCaseUpdate(currentCase, { type: "LANDLORD_REJECTED_PLAN", note: "SIMULATION" }));
update(simulateMariaAssistanceUnavailable(currentCase));
update(runMariaTransition(currentCase)); // both changes atomically, no timeout closure
update(resetMaria()); // fresh relative dates, no stale flags/completions
```

These are alternative button handlers, not four lines to run consecutively. Use the actual current case at invocation. The ordinary “application denied” update stays `ASSISTANCE_DENIED` and does not set simulation flags. Do not add special behavior based on the word “Demo” in a note or Maria's name.

Show `case.demoScenario.label` persistently when present, alongside the classification reasons. Describe the scenario as **modeled immediate financial options unavailable**, not “all legal rights lost” or “eviction inevitable.” Legal review remains uncertain and available in parallel. Never use a simulation result for a real case without a clear simulation label and reset.

## Response contracts

| Field | Meaning / display requirement |
|---|---|
| `classifyCase(...).legalUrgency` | `IMMEDIATE`, `SOON`, `VERIFY`, or `ROUTINE`; independent of recovery status. Always returned at runtime. |
| `.preservation.paths` | Payment arrangement, assistance, own funds, legal review, each with state and reason. A declined arrangement is one path only. |
| `.preservation.recoveryPriority` | Prioritize transition support. Not a court outcome prediction. |
| `FinancialGap.confirmedHousingFunds` | Reported housing cash + explicitly allocated, timely paycheck + reported approved, timely, purpose-specific award. Not independently verified or necessarily already received. |
| `.confirmedAssistance` | Known approved amount with payment date and matching `STAY`/`MOVE` purpose. Never count awards already included in cash or already applied to debt. |
| `.confirmedRemainingGap` / legacy `.remainingGap` | Same conservative remaining gap. Hypothetical program dollars never reduce it. |
| `.potentialSupport` | Resource ID/name/status, `amount: null`, eligibility and reasons. Display “Amount unknown; confirm with provider,” never `$0 awarded`. |
| `.sources`, `.totalEstimatedAssistance` | Legacy compatibility fields: empty array and zero. No stacked hypothetical awards. |
| `.obligationIsEstimate` | `true` for MOVE. Deposit + first month at current rent + $400 illustrative moving cost. |
| `.outstandingRentDebt` | Existing reported debt remains relevant when the display changes to MOVE. Do not imply it was forgiven. |
| `PaymentPlan.affordability` | `ILLUSTRATIVE`, `USER_CONSTRAINED`, `NOT_AFFORDABLE`; none is professional financial certification. |
| `.unallocatedBalance`, `.feasible` | Explicit unpaid amount after at most six future installments plus upfront cash; never increase payments to fit the cap. |
| `ResourceMatch.eligibility` | `POTENTIALLY_RELEVANT` or `UNKNOWN`; never “eligible.” `evaluateResource()` also exposes exclusions and reasons. |
| `.availability`, `.constraintsEvaluated` | Provider status and evaluated known restrictions. County/ZIP/filing checks are not comprehensive eligibility screening. |
| `Resource.sourceUrl`, `.verificationNotes` | Evidence link and scope of verification. `lastVerified` is a source-check date, not confirmation of funds. |
| `AssistanceStatus.PENDING` | Application submitted, response unknown; distinguish from actual `WAITLISTED`. Update any exhaustive labels. |
| Case API `persisted: false`, `storageMode: "BROWSER_ONLY"` | Case computation only; no cloud retrieval or persistence. `sessionId` is compatibility data, not authentication. |

## Optional financial inputs (no intake expansion required)

Existing callers work without these. A later edit panel may set `nextPaycheckHousingAllocation`, `maxAffordableToday`, `essentialReserveToday`, `maxAffordablePerPaycheck`, `essentialReservePerPaycheck`, and `payIntervalDays`. Amounts are dollars to cents. Limits and reserves both constrain the amount; a reserve is subtracted from gross cash/income, not from an already reduced maximum.

Approved award inputs: `approvedAssistanceAmount`, `approvedAssistanceAvailableDate` (`YYYY-MM-DD`), `approvedAssistancePurpose` (`STAY` or `MOVE`), with `assistanceStatus: "APPROVED"`. Unknown amount or timing contributes zero. Dates after court do not count toward STAY; the court date is a planning cutoff, not a computed legal payment deadline. Income without a date is excluded.

## Other integration checks

- Recovery still includes legal aid, hearing preparation/attendance, and judgment guidance. Show these as prominently as housing support.
- Court date today produces TODAY actions. Missing or past hearing information generates a verification task. Changing court facts clears related completion IDs; changing overall status clears all completions for review.
- All reviewed catalog availability is `UNKNOWN`; “Open only” currently returns no matches. Explain the empty result and let users remove that filter. Never relabel unknown as open to fill the screen.
- ZIP/filing constraints require published source metadata. The catalog contains actual sourced Duluth ZIP and AVLF filing constraints; other restrictions remain provider-confirmed.
- Confirmed tenant document fields remain editable before `applyExtractedDocument`; `HIGH` extraction confidence never means a deadline or legal claim is correct.
- A sample summons is fictional. Demo impact counters on the landing page must remain clearly simulated; there are no measured housing outcomes in this implementation.
- Civil dates use America/New_York, regardless of device/server timezone. Financial cents should be displayed when present; the legacy `formatMoney` helper rounds for display.

## UI acceptance rehearsal

Reset Maria → $900 remaining STAY gap → reject arrangement (still legal help) → explicit assistance simulation → recovery + $2,400 illustrative MOVE gap + $1,400 separately outstanding debt → changed resource order and action priorities → persistent legal guidance → reset. Repeat without an Anthropic key, Supabase, or internet. This visual rehearsal is pending UI integration; backend/API tests and `npm run demo:evidence` cover the underlying computation.
