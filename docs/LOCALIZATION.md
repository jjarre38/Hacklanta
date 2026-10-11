# English / Spanish integration

Implemented on `codex/english-spanish-localization`. English is the default; no locale-prefixed URLs, application dependencies, translation service, translation API key, or database schema changes were added. Existing Next.js 14 App Router and React 18 APIs are used.

## Architecture and maintenance

- `lib/i18n/es.json` is the bundled Spanish dictionary. English source strings are readable fallback keys, so English remains available even if a translation is missing. `MessageKey` exports the known-key type. Templates use named or numbered placeholders; values are substituted once and rendered as React text, not HTML.
- `lib/i18n/core.ts` provides pure translation and a restricted adapter for existing HomePath-authored English resource/validation/classification output. The adapter matches bundled templates; it must never be applied to arbitrary notes, names, documents, or edited message bodies.
- `LocaleProvider` holds presentation state independently of the case store. It writes only the `homepath-language` localStorage preference and a same-name, SameSite=Lax cookie. It updates document language/title without navigation. The cookie gives SSR the preferred language; localStorage is restored after hydration when available. English is the fallback if neither preference is available. Cookie-aware rendering makes these pages dynamic in Next.js.
- Desktop navigation and the existing mobile menu each contain a compact, labeled native English/Español selector. The existing layout, styling, routes, form components, and navigation structure remain in place.
- Shared formatting uses `en-US` / `es-US`, USD, and America/New_York for civil dates. Monetary calculations are not localized or changed. The offline message template retains exact cents.
- Recommendation generation accepts an optional presentation locale. Its authored templates interpolate the same case facts; IDs, urgency, sorting, links, completion flags and decision branches are unchanged. Housing guidance has the same presentation-only parameter. Resource data/matching and case classification remain canonical, with text translated only for display.
- The case store ignores language-only cross-tab storage events, preventing unrelated reclassification. Language state never calls case persistence, clears completions, submits intake, or changes saved financial values.

To add text, add its Spanish entry and call `tr(englishTemplate, values)` for new presentation text. For static authored catalog fields, use `text(field)` at the presentation boundary. Keep identifiers, enum values, control flow, URLs and user data out of translation. Tests check placeholder parity, literal call coverage, resource/legal coverage, and English fallback.

## Coverage

Landing page; navigation/footer/banners and image alternatives; all eight intake steps and HomePath validation messages; dashboard/status explanations; preservation and recovery recommendations; action completion and progress; case-update labels; timeline summaries; resource descriptions, instructions, matching reasons, filters and statuses; legal explanations and glossary; housing and employment; calculator/payment labels; document upload/review and consent; account/sign-in/sign-up/sync states; empty/loading/error states; browser narration and optional external-service controls.

Organization/program names, addresses, phone numbers, county names, source names, legal citations, links, user-entered notes/names, uploaded documents, extracted quotations/deadlines, and edited or already-generated messages retain their original wording. External provider websites/emails and browser-native form/date/audio UI are controlled by those providers or the user's device, not HomePath.

### Historical events

`presentCaseEvent` reads supported event types without changing stored history. Exact known authored prefixes are translated and any appended user note is preserved verbatim. When an older record mixes facts/notes with unstructured English, show a Spanish event-type summary and an expandable **Original recorded details (unchanged)** containing the full original record. Unknown event types are displayed as recorded. No migration or guessed translation of historical notes occurs.

### Optional drafting and extraction

- **Free message template:** fully local, English/Spanish, user-triggered. Uses the same payment amounts/dates and names, discloses any unpaid balance, and makes no legal or acceptance guarantees. Users can edit/copy/send using their own email/SMS apps. Switching language never rewrites an existing message.
- **Claude drafting:** validated `language: "en" | "es"` defaults to English for older callers. The existing single model request asks for the subject/body directly in the selected language. There is no second translation request. Consent, bearer authorization, rate/body limits, output validation, timeout and safe errors remain.
- **Claude extraction:** original upload and extracted facts remain unchanged. Only the surrounding interface is translated. Explicit consent is now included in the upload UI before real uploads; the labeled sample continues to work without consent, credentials or AI. No translation prompt was added to document extraction.
- The existing AI endpoints require the server's private operator authorization token. Public browsers do not receive that token and therefore cannot enable live Claude by merely checking consent; they receive a localized disabled/authorization error and can use the local template/sample/manual path. This existing authorization boundary was deliberately preserved.

### Narration

**Device voice** is the default. On an explicit Read my plan click, HomePath selects a matching English/Spanish `speechSynthesis` voice with `localService === true`; no browser cloud voice is chosen. If unavailable, it says so. Voice availability depends on the device and installed language packs. A language change stops stale narration but starts no new narration.

**ElevenLabs** remains an optional explicit selection. It requires a separate consent checkbox and Read my plan click, sends the selected-language narration in one request, and uses the existing multilingual model configuration. The route validates language/consent, bounds the request body, retains origin checking and timeout, and has a five-request per-process/minute ceiling. The ceiling is not a distributed production quota or user authentication system.

## External requests and who pays

| Feature | Actual request path | Trigger / payer |
|---|---|---|
| Language selection/restoration, translated pages, recommendations, template | None to a translator or model | Bundled content; no per-page translation charge |
| Local browser narration | Device speech synthesis only | Explicit click; no API charge |
| Optional AI landlord draft | `/api/draft-message` → Anthropic | Explicit consent + existing operator authorization; Anthropic key owner/site operator pays |
| Optional real document extraction | `/api/document` → Anthropic | Explicit consent + existing operator authorization; Anthropic key owner/site operator pays |
| Optional ElevenLabs narration | `/api/speech` → ElevenLabs | Explicit provider choice, consent and click; ElevenLabs key owner/site operator pays |
| Existing accounts and account plan sync | Supabase Auth/database | Existing sign-in/account behavior; deployment operator's Supabase plan |
| Resource/case routes and sample extraction | HomePath's own API | Normal application hosting; resource bundle and sample do not call AI |
| Email/SMS and provider links | User's chosen app/provider | Explicit user action; ordinary carrier/provider terms apply |

No real paid API requests were made during verification. Claude integration was checked with a mocked SDK response and call count. Test-server account and paid-service credentials were blank; browser tests blocked non-local traffic. Local `.env.local` was not read or modified for this work and remains ignored.

## Human review and practical limits

The Spanish legal text is a development translation, **not attorney-reviewed**. A fluent Spanish reviewer and Georgia housing-law professional should review legal notices, service/answer/appeal timing, tender and court-payment rules, writ/default distinctions, county procedures, and glossary before public service use. Citations, legal-source links, and the underlying English legal guidance were retained; this work did not independently revalidate the law or provider availability. The Spanish rights page states the review limitation.

Fluent human review is also recommended for clarity, tone, accessibility, and regional terminology throughout intake, recommendations, resources, consent and accounts. Original English claims elsewhere in the completed UI (including demo availability/outcome wording and employment/benefit claims) were translated, not independently verified or redesigned. Existing demo buttons still use their original case-update behavior; this task does not change their decision logic.

## Verification

- Unit/API tests: 73 passing (63 existing plus 10 localization tests).
- TypeScript and lint: passed.
- Browser: desktop/mobile switching both directions, persistence/SSR language, intake state, Maria completion, resource ordering, recovery state, original notes/extracted facts, offline Spanish message, no paid requests, and no uncaught page errors passed. The complete eight-step Spanish intake, 320px mobile layout, and cross-tab language synchronization also passed.
- Production build: passed with Next.js 14.2.35. Existing non-fatal webpack cache snapshot warnings remain; compilation, type validation and route generation succeeded.

Browser checks are in `tests/browser-localization.mjs`. They use an optional, separately installed Playwright and local Chrome, so no application dependency was added. Run against a test server with account and paid-service credentials disabled, for example:

```sh
HOMEPATH_PLAYWRIGHT_PATH=/path/to/playwright/index.mjs node tests/browser-localization.mjs
```

Optional overrides: `HOMEPATH_TEST_URL` and `HOMEPATH_CHROME_PATH`. Browser screenshots are written to the system temporary directory, not committed.

## Changed files

The exact implementation file list follows (generated from this branch's working diff):

- `app/account/AccountClient.tsx`
- `app/account/page.tsx`
- `app/api/speech/route.ts`
- `app/dashboard/DashboardClient.tsx`
- `app/dashboard/DashboardSkeleton.tsx`
- `app/dashboard/error.tsx`
- `app/dashboard/page.tsx`
- `app/employment/EmploymentClient.tsx`
- `app/employment/error.tsx`
- `app/employment/page.tsx`
- `app/housing/HousingClient.tsx`
- `app/housing/error.tsx`
- `app/housing/page.tsx`
- `app/intake/error.tsx`
- `app/intake/page.tsx`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/page.tsx`
- `app/payment-plan/PageContent.tsx`
- `app/payment-plan/PaymentPlanClient.tsx`
- `app/payment-plan/error.tsx`
- `app/payment-plan/page.tsx`
- `app/resources/ResourcesClient.tsx`
- `app/resources/error.tsx`
- `app/resources/page.tsx`
- `app/rights/PageContent.tsx`
- `app/rights/error.tsx`
- `app/rights/page.tsx`
- `components/dashboard/ActionPlan.tsx`
- `components/dashboard/CaseTimeline.tsx`
- `components/dashboard/CaseUpdatePanel.tsx`
- `components/dashboard/DemoControls.tsx`
- `components/dashboard/RecoveryMode.tsx`
- `components/dashboard/StatusBanner.tsx`
- `components/dashboard/VoicePlan.tsx`
- `components/document/DocumentUpload.tsx`
- `components/document/ExtractionReview.tsx`
- `components/intake/IntakeWizard.tsx`
- `components/intake/fields.tsx`
- `components/intake/steps.tsx`
- `components/layout/ErrorFallback.tsx`
- `components/layout/Footer.tsx`
- `components/layout/Navigation.tsx`
- `components/layout/PageBanner.tsx`
- `components/paymentplan/DraftedMessage.tsx`
- `components/paymentplan/PaymentPlanCalculator.tsx`
- `components/paymentplan/SendToLandlord.tsx`
- `components/resources/ResourceCard.tsx`
- `components/resources/ResourceCombinationPanel.tsx`
- `components/resources/ResourceFilters.tsx`
- `components/resources/ResourceListSkeleton.tsx`
- `components/rights/RightsCard.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Expandable.tsx`
- `docs/LOCALIZATION.md`
- `lib/ai/messageDrafter.ts`
- `lib/client/caseStore.ts`
- `lib/engine/housingGuidance.ts`
- `lib/format.ts`
- `lib/i18n/LocaleProvider.tsx`
- `lib/i18n/core.ts`
- `lib/i18n/es.json`
- `lib/i18n/events.ts`
- `lib/i18n/landlordTemplate.ts`
- `lib/i18n/pageTitles.ts`
- `lib/i18n/server.ts`
- `lib/i18n/speech.ts`
- `lib/intake/schema.ts`
- `lib/services/recommendationService.ts`
- `tests/browser-localization.mjs`
- `tests/localization.test.ts`

Bundled Spanish messages: 964.
