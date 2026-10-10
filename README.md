# HomePath

A Metro Atlanta eviction prevention and housing stability platform. HomePath helps renters facing eviction answer one question: **"What can I still do next?"**

- If staying is possible, HomePath helps the renter stay.
- If staying isn't realistic, it helps them limit the damage and find stable housing.
- The user never hits a dead end.

Service area (MVP): Fulton, DeKalb, Cobb, Gwinnett, and Clayton counties, Georgia.

> HomePath provides general legal information, not legal advice. The resource listings, availability statuses, assistance amounts, and impact numbers are **demo data**.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then fill in values (see below)
npm run dev                        # http://localhost:3000
```

Other scripts:

| Script | What it does |
|---|---|
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from `lib/data/resources.ts` |

## Environment variables

| Variable | Required | Used for |
|---|---|---|
| `ANTHROPIC_API_KEY` | For AI features | Drafting landlord messages and extracting data from uploaded documents. Without it, those two features show a "not configured" message. Everything else still works. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase browser key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-side writes (cases, documents, storage) |

**Without Supabase**, the app runs fully in guest mode: cases are stored in `localStorage` and resources come from the bundled static dataset.

**With Supabase:**

1. In the SQL editor, run `supabase/schema.sql`. This creates the tables, the indexes, row-level security, and the private `documents` storage bucket.
2. Run `supabase/seed.sql` to load the resources.
3. Set the three Supabase env vars.

The case API then upserts cases, events, and action items keyed by the guest session ID. Uploaded documents go to Storage. Resources are read from the database.

## Demo script (about 3 minutes)

1. **Landing page (`/`).** Read the headline, then open "How it works", the impact metrics (labeled as demo data), and the service-area callout.
2. **Click "Build My Action Plan."** Step through a question or two. To show the out-of-area handling, choose "Another county" and point out the friendly fallback: 2-1-1, GeorgiaLegalAid.org, and the rights page.
3. **Click "Demo: Load Maria's Case"**, then **"Build my plan."**
   - Maria: Fulton County, $1,250 rent, $1,400 owed, $500 available today, $450 next paycheck, 3-person household with children, reduced income, court date in 7 days.
4. **Dashboard (`/dashboard`):**
   - Her status is **Legal Help Recommended**. Open "Why this status?" to see the rule that fired.
   - Walk through the action plan, which is grouped into Today, Before court, This week, and Ongoing. Every item explains *why* it's there.
   - "Closing your rent gap": $500 today + $450 paycheck + an estimated $450 from Fulton County assistance = covered.
   - Payment plan calculator: $500 today, then two payday installments of $450. Edit an amount and watch the remaining balance update. Click **Draft Message to Landlord** (requires `ANTHROPIC_API_KEY`).
   - Document upload: click **Demo Document** to have Claude read a sample summons. Review the fields, then confirm to update the case.
5. **The key moment.** In **Demo Controls**, click **"Run both → see recovery transition."** The landlord rejects the plan, assistance becomes unavailable, and the status animates from coral to violet, changing to **Transition & Recovery**. The action plan, the financial panel (now move-in costs), and the resources all switch to the recovery path.
6. Under "What is making housing hardest?", pick **Deposit and application fees**. The plan and resources reorder.
7. Open **Find affordable housing** (`/housing`) and **Rebuild income** (`/employment`). Finish on **Know Your Rights** (`/rights`), where cards matching Maria's stage are highlighted.

Use **Reset Maria** in Demo Controls to start over.

## Architecture

```
app/                      Pages (App Router) and API routes
  api/case                POST: intake → classify → (persist) · PUT: sync an updated case
  api/resources           GET: resources + scored matches (county/category/stage/openOnly)
  api/draft-message       POST: Claude drafts a landlord message from a deterministic plan
  api/document            POST: Claude extracts fields from a PDF/image (or the demo notice)
components/               UI, grouped by feature (intake, dashboard, resources, paymentplan, document, rights)
lib/
  engine/                 Pure deterministic logic. No I/O, no AI.
    caseClassifier.ts       CaseStatus rules (documented in code)
    resourceMatcher.ts      Resource scoring and match explanations
    resourceCombinationEngine.ts  How funds + programs close the gap (rent, or move-in costs in recovery)
    housingGuidance.ts      Housing search guidance
  services/
    recommendationService.ts  ActionItem generation, each with a `reason`
    paymentPlanService.ts     Installment math
    caseService.ts            Create/update/reclassify cases (pure)
    resourceService.ts        Load resources (Supabase → static fallback)
    casePersistence.ts / documentService.ts  Supabase writes (server-only, optional)
  ai/                     The only Claude touchpoints
    messageDrafter.ts       Structured output (Zod) and a no-legal-claims prompt
    documentParser.ts       PDF/image extraction, null-not-guess, re-validated with Zod
  data/                   Service area, resource dataset, and Georgia rights content (hardcoded, sourced)
  client/                 localStorage case store (guest mode) and resource hook
  demo/                   Maria seed and the sample eviction summons
supabase/                 schema.sql, seed.sql (generated)
```

**Design rules**

- **AI is used for prose and extraction only.** Case status, action plans, money math, and resource matching are deterministic TypeScript. Claude (`claude-opus-5-5`) is called through `@anthropic-ai/sdk`. It uses schema-constrained structured output and server-side refusal fallbacks (`fallbacks: "default"`).
- **Expanding to new areas means editing data, not code.** Add a county to `lib/data/serviceArea.ts` and list it in each relevant resource's `countiesServed`. No component hard-codes county names.
- **Privacy.** No accounts, no SSNs, and no banking details. Guest data stays in the browser unless Supabase is configured.
- **Language.** Resources always say "you may qualify", never "you qualify". The app never says "no options available": recovery resources are always shown.

## Before real-world use

- Verify every resource's phone number, website, eligibility, and status with the organization.
- Have a Georgia attorney review `lib/data/rightsContent.ts`.
- Replace the demo `typicalAmount` estimates and the impact metrics with real data.
