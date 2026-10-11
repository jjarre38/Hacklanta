# HomePath backend implementation review

## Audit and scope

Started from a clean `main` working tree. Created `codex/homepath-reliability` after the sandbox required Git-ref approval. No uncommitted teammate work was overwritten. No commit, merge, force-push, deployment, live database change, or paid AI request was made. No visual page/component/layout/style file was edited.

Confirmed the original denial/rejection recovery rule, greedy demo funding arithmetic, unrestricted installment balancing, shallow PUT validation, privileged guest writes, automatic document storage, uncertain catalog status claims, and missing `.env.local.example`. The test suite was absent. Existing Maria relative-date seed and deterministic/AI boundaries were retained.

## Changes and behavior

| Area | Files | Result |
|---|---|---|
| Preservation and legal urgency | `lib/engine/caseClassifier.ts`, `lib/services/caseService.ts`, `lib/services/recommendationService.ts`, `types/index.ts` | Denial, rejection, and judgment no longer imply exhaustion. Structured path reasons and parallel legal urgency. Recovery keeps legal tasks; explicit user transition intent works. |
| Finance and payments | `lib/engine/housingFunds.ts`, `lib/engine/resourceCombinationEngine.ts`, `lib/services/paymentPlanService.ts` | Uncertain awards never reduce confirmed gap. Explicit income allocation, reserves, award amount/date/purpose, cent arithmetic, installment cap, explicit remaining debt and illustrative status. MOVE estimate does not erase rent debt. |
| Scenario and evidence | `lib/demo/mariaSeed.ts`, `lib/demo/sampleNotice.ts`, `scripts/demo-evidence.ts` | Explicit labeled simulation, atomic full transition, reset, seeded no-AI sample response, repeatable JSON evidence. |
| Matching and resources | `lib/engine/resourceMatcher.ts`, `lib/data/resources.ts`, `lib/services/resourceService.ts` | Known sourced constraints, unknown eligibility/availability preserved, 16 official-source contacts/referrals, no invented awards/openings, local deterministic catalog. |
| Dates and case validation | `lib/format.ts`, `lib/intake/schema.ts`, `lib/validation/case.ts` | Real calendar-date checks, Atlanta civil dates, nested validation, invalid update rejection, pending distinct from waitlisted, stale legal-task completions cleared when court facts change. |
| Guest privacy and APIs | `app/api/case/route.ts`, `app/api/document/route.ts`, `app/api/draft-message/route.ts`, `lib/services/requestSafety.ts`, `lib/services/casePersistence.ts`, `lib/services/documentService.ts`, `lib/client/caseStore.ts` | No privileged guest writes, no document storage, no background sync, bounded bodies, operator-only live AI plus consent and per-process rate limit. |
| AI boundary | `lib/ai/documentParser.ts`, `lib/ai/messageDrafter.ts`, `lib/ai/errors.ts`, `lib/anthropic.ts` | Untrusted-input instructions, strict dates/output validation, overpayment rejection, exact cents in prompts, partial-plan explanation, limited tokens/timeout/retries, safe logs. |
| Supabase boundary | `lib/supabase.ts`, `lib/supabaseServer.ts`, `supabase/schema.sql`, `scripts/generate-seed.ts`, `supabase/seed.sql` | Server-only privileged helper, disabled guest writes explained, regenerated local seed, unknown boolean metadata remains null. No live migration. |
| Legal/housing information | `lib/data/rightsContent.ts`, `lib/engine/housingGuidance.ts` | Direct sources, notice applicability and answer exceptions, tender correction, writ/default distinction, less categorical hearing/affordability language. |
| Setup/tests/documentation | `package.json`, `.env.local.example`, `README.md`, `tests/*.test.ts`, `docs/*` | Existing Next.js workflow preserved. Node test runner uses installed tsx; no added dependency or lockfile churn. |

## Additional findings and decisions

- A valid hearing date now takes precedence over a stale pre-filing/unknown stage. An invalid calendar date no longer rolls into another month. Hearing dates and judgment updates invalidate related checked-off actions even if the top-level status remains unchanged.
- The old financial bar can mislabel confirmed support and the demo uses a stale timeout callback. Neither was silently edited; exact fixes and safety-critical labels are release blockers in `UI_HANDOFF.md`.
- The browser's “for this session” privacy wording contradicts localStorage retention. Removing server sync does not fix that wording; the UI handoff explicitly requires correction.
- An approval letter is not a paid award or tender. Approval without amount/purpose/timing cannot fill the gap. Reported funds can still be wrong; assumptions and provider confirmation are explicit.
- A regional organization is not necessarily a county-wide program, and a referral is not a grant. City jurisdiction and complex household/referral restrictions remain uncertain. A smaller sourced catalog is preferable to the earlier unsupported directory.
- Full court-date/housing-outcome prediction, complete eligibility adjudication, and program-opening monitoring are not implemented. The app provides triage and planning, with qualified-human review.

## Validation

Final verification on October 10, 2026 (all commands actually ran):

| Command | Result |
|---|---|
| `npm test` | **63 passed, 0 failed, 0 skipped**. Engine, calendar, financial, payment, catalog and API/security behavior. |
| `npm run typecheck` | Exit 0, no TypeScript errors. |
| `npm run lint` | Exit 0, no ESLint warnings or errors. |
| `npm run build` | Exit 0; compiled, checked types/lint, generated all 16 static-generation entries and completed build traces. Webpack emitted a nonfatal cache-snapshot warning. |
| `npm run demo:evidence -- 2026-10-10T16:00:00Z` | Exit 0. Initial/rejected: legal help, $900 STAY gap. Explicit simulation: recovery, $2,400 MOVE gap; legal urgency IMMEDIATE throughout. |
| `node --import tsx scripts/demo-evidence.ts 2026-10-10T16:00:00Z > docs/demo-evidence.json` | Exit 0; regenerated checked-in replay evidence from final code. |
| `npm run db:seed-sql` | Initial sandbox run failed with EPERM on the tsx temporary IPC socket. Approved rerun outside the sandbox succeeded, exit 0, writing 16 resources to the local SQL file. No database connection. |
| `git diff --check` | Exit 0; no whitespace errors. |
| Visual-file diff audit | No changes under `components/`, non-API `app/`, layouts, CSS, or Tailwind. |

Tests exercise business outcomes and API boundaries, including a mocked provider failure and a network trap for privileged storage. No paid model call, live Supabase test, visual-browser rehearsal, or deployed ownership policy verification was claimed. The build used the existing local environment file without reading or printing its secrets. An initial lint failure on three unused compatibility parameters was corrected; the final run is clean.

## Tradeoffs and remaining blockers

1. **UI integration is pending and blocks the visual Maria transition and safe public wording.** Follow `UI_HANDOFF.md` and rehearse after integration. Service-level end-to-end evidence does not substitute for that rehearsal.
2. **Guest persistence is intentionally unsupported on the server**, even when credentials exist. This removes cross-user modification risk at the cost of multi-device retrieval. Existing historical cloud data requires an authorized cleanup review; it was not deleted.
3. **Live AI is unavailable to ordinary guest browsers.** Operator token and consent are required; a public authenticated/rate-limited workflow is deferred. Per-process throttling alone is not a distributed abuse control. Provider quality/current model access was not tested with a paid call.
4. **All catalog availability remains unknown.** No funding, bed, provider eligibility, or award has been personally confirmed. The open-only filter can be empty; the UI must explain it.
5. **Legal review is not attorney approval.** The official code source covers the 2025 session; current 2026 applicability and case-specific exceptions require review. Failed handbook/Legal Aid retrievals are documented.
6. **Financial assumptions remain user-reported.** Avoid double counting awards already included in cash or applied to debt. The engine does not model every future month's rent, fees, essential expense, award disbursement, or move-in deadline. The MOVE estimate is illustrative; existing rent debt is separate. UI edits must validate and recalculate proposal metadata.
7. **No measured impact or judging prediction.** No unsupported eviction statistics, winning claims, agents, new infrastructure, geography expansion, or UI features were added.

Deferred: full authentication/ownership persistence, cloud deletion workflow, distributed public AI quota, ongoing provider verification, exhaustive statutory deadline calculation, and legal review by counsel. These exceed the minimal reliable demo's authorized backend scope or require human/provider evidence.
