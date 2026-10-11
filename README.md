# HomePath

HomePath identifies the paths still available to keep a Metro Atlanta renter housed and helps them plan a safer transition when staying is no longer realistic.

The MVP serves **Fulton, DeKalb, Cobb, Gwinnett, and Clayton**. It provides general information and planning support, not legal advice, representation, guaranteed eligibility, or predictions of court outcomes.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The Maria flow and resource catalog require **no credentials**. `.env.local.example` contains optional placeholders; copy it to `.env.local` only if you need configuration and have not already created a local file. Never overwrite existing secrets or commit `.env.local`.

| Command | Purpose |
|---|---|
| `npm test` | Node test runner + existing tsx, no new test dependency |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | Next.js ESLint |
| `npm run build` / `npm start` | Production build / server |
| `npm run demo:evidence` | Execute Maria's offline service journey and print explanations |
| `npm run demo:evidence -- 2026-10-10T16:00:00Z` | Fixed-date evidence replay |
| `npm run db:seed-sql` | Generate optional SQL locally; does not contact a database |

## Demo truthfulness and UI integration

Maria starts with $1,400 owed and $500 available for housing: **$900 remains**. Her $450 paycheck is excluded until explicitly allocated. Matches never become awards through arithmetic. Her payment proposal is an editable illustration, not certified affordable.

A declined plan or denied assistance application does not establish that preservation is exhausted. The explicit simulation changes structured financial-path availability, recomputes the plan, and prioritizes recovery while retaining legal help. The MOVE budget is an illustrative $2,900, leaving $2,400 after housing cash; existing rent debt is separate.

**The existing visual demo callbacks and financial/privacy labels need the changes in [UI_HANDOFF](docs/UI_HANDOFF.md).** Backend/API behavior is tested, but do not present the current visual transition as integrated. The teammate's visual files were intentionally untouched.

See [DEMO_EVIDENCE](docs/DEMO_EVIDENCE.md) and [generated JSON](docs/demo-evidence.json) for the exact inputs, transitions, calculations, priorities, reset, and seeded/simulated boundaries. “Demo Document” uses seeded fields without AI; label it accordingly. Landing-page demo counters are not measured impact.

## Deterministic architecture

- `lib/engine`: independent legal urgency/preservation evaluation, conservative financial gap, sourced restriction checks, explainable ranking, housing planning.
- `lib/services`: case updates, action generation, constrained payment schedules, reviewed resource loading. Guest case/document persistence is intentionally disabled.
- `lib/demo`: Maria, explicit scenario functions, sample notice and seeded extraction.
- `lib/validation`: nested server/client case validation; `lib/intake/schema.ts` validates intake.
- `lib/ai`: optional document extraction and landlord-message drafting only. No LLM controls status, money, matching, or priority.
- `app/api`: bounded requests, validation, computation, optional protected AI. No guest case read/store API.
- `lib/client/caseStore.ts`: browser-local saved case, no background sync. Clearing removes both case and session keys.

Civil dates use America/New_York. Court-day differences prioritize tasks; they are not legal deadline calculations. Resource checks can exclude known county/ZIP/filing mismatches, but never establish complete eligibility.

## Optional services and privacy

| Variable | Behavior |
|---|---|
| `ANTHROPIC_API_KEY` | Optional server-side key; alone does not enable public AI |
| `HOMEPATH_AI_ACCESS_TOKEN` | Private operator bearer token, at least 32 characters; never put in browser code |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Legacy optional setup variables; do not enable guest persistence or remote catalog loading |

Protected live AI also requires explicit consent to third-party processing. Ordinary public-browser AI requests remain disabled. The offline sample and manual case entry work without AI. No live model call is needed to demonstrate the engine.

Guest cases stay in localStorage until cleared, including across browser restarts. Initial intake is processed by the server without retention. No uploaded documents or extractions are stored in cloud storage. Previously stored cloud records, if any, are not automatically deleted. See [SECURITY_PRIVACY](docs/SECURITY_PRIVACY.md).

`supabase/schema.sql` and generated seed SQL remain optional legacy artifacts; no deployment or migration is performed. Seed upserts do not remove old rows. The public app always uses the reviewed local catalog so database drift cannot restore invented program openings.

## Evidence and limits

- [Resource verification](docs/RESOURCE_VERIFICATION.md): 16 sourced contacts/referral services; current funding and beds remain unknown.
- [Legal review](docs/LEGAL_REVIEW.md): direct Georgia sources, corrections, failed retrievals and remaining attorney-review needs.
- [Implementation review](docs/IMPLEMENTATION_REVIEW.md): changes, tests, tradeoffs, deferred work and release blockers.

Before real-world use, complete the UI handoff, obtain Georgia legal review, and confirm priority providers' current intake. Do not infer availability from a working website or an eligibility guarantee from a match score.
