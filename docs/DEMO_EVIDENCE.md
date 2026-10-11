# Maria: inspectable, offline demo evidence

Product statement: **HomePath identifies the paths still available to keep a Metro Atlanta renter housed and helps them plan a safer transition when staying is no longer realistic.**

Run `npm run demo:evidence` for dates relative to today, or `npm run demo:evidence -- 2026-10-10T16:00:00Z` to reproduce the checked-in `demo-evidence.json`. This script executes the same services used by the application. It does not call AI, Supabase, or external websites. IDs/timestamps in normal cases may vary; the script omits random event IDs from evidence.

## Initial structured input

Fictional Maria, Fulton County, ZIP 30310; monthly rent $1,250; reported debt $1,400; cash available for housing $500; monthly income $1,950 after reduced hours; next paycheck $450 in three days; household of three including two children; court in seven days. No landlord contact, arrangement, or assistance application. The seed says employed full time with recently reduced income, matching the original implementation. No claim is made about real case outcomes.

With the fixed run above, payday is October 13 and court is October 17, 2026. Relative dates are for a fictional scenario, not verification that a real court sits that day.

| Step | Structured change | Recomputed result |
|---|---|---|
| Initial | `resetMaria(now)` | `LEGAL_HELP_RECOMMENDED`, `legalUrgency: IMMEDIATE`; court seven days away. |
| First simulation | `LANDLORD_REJECTED_PLAN`, note `SIMULATION` | Payment arrangement is `DECLINED`. Status stays legal help. Other assistance remains uncertain. |
| Second simulation | `simulateMariaAssistanceUnavailable(case, now)` | Sets `demoScenario.simulated` and `immediateAssistanceUnavailable`, clears stale award inputs, appends a labeled event, reclassifies. |
| Recovery | Declined arrangement + simulated lack of modeled immediate assistance + insufficient reported cash and explicitly allocated timely income | `TRANSITION_RECOVERY`, legal urgency remains `IMMEDIATE`. This prioritizes backup housing, not a prediction of inevitable eviction. |
| Reset | `resetMaria(now)` | Restores initial values, no simulation, no denial/rejection flags, no completed tasks. |

`runMariaTransition(case, now)` performs both changes atomically. A real denial, a rejection, both together, or judgment alone do not force recovery. Explicit `stayingNotRealistic` or `newHousingFound` can prioritize transition independently.

## What the engine explains

Preservation evaluation exposes four paths: payment arrangement, assistance, own funds, and qualified legal review. The financial simulation makes the modeled immediate rent-assistance path unavailable. **Legal review remains uncertain, never exhausted.** The explanation identifies the exact changed facts. It does not claim all real providers or remedies were checked.

Initial finance is $1,400 − $500 = **$900 remaining**. The $450 paycheck has no explicit housing allocation, so it is excluded. Program matches carry unknown amounts and cannot close the gap. If Maria explicitly allocates $300 of her upcoming paycheck, the gap becomes $600, with expected-income assumptions visible. An approved award needs a known amount, upcoming payment date, and matching purpose.

Initial proposal remains **illustrative**: $500 now, $450 in three days, $450 fourteen days later. It totals $1,400 but extends beyond court and does not certify affordability, cancel a hearing, or establish landlord acceptance. Optional contribution caps and reserves change this calculation; at most six future payments are proposed, leaving an explicit balance if necessary.

Recovery finance estimates a $1,250 deposit + $1,250 first month + $400 moving costs = **$2,900**. With the same $500 housing cash and no new allocation, the illustrative MOVE gap is **$2,400**. The **$1,400 existing rent debt remains separately outstanding**. Move costs are a scenario assumption, not local price research or an offer.

Initial actions emphasize legal aid, rental-assistance inquiries, landlord communication, court preparation, and records. Recovery adds housing search, a safe backup place, deposit inquiries, moving/furniture referrals, employment/income restoration, benefits, and family support. Legal aid and hearing tasks remain. Resource ranking shifts toward housing and recovery needs; the simulation excludes immediate rent-assistance matches without changing real provider statuses.

## Live, seeded, simulated

- **Working computation:** classification, legal urgency, path explanations, cent-based payment math, conservative gap, sourced restriction checks, resource ranking, action generation, schema validation, no-write guest APIs, reset.
- **Seeded:** Maria, sample notice, sample extracted fields, reviewed resource catalog. Sample extraction is deterministic and clearly returns `SEEDED_SAMPLE_NO_AI`.
- **Simulated:** landlord rejection and modeled immediate assistance unavailability. They are structured scenario inputs, not reports about named providers or real decisions.
- **Unverified:** current cash/bed availability, household eligibility, case outcome, affordability beyond reported limits, live AI quality, housing impact. No user outcomes or judge-score claims were invented.
- **Optional AI:** document extraction and landlord-message prose only; real calls require consent and an operator token. They are outside the core demonstration.

## Reproducibility status

The service/API journey is covered by 63 passing automated tests and the JSON evidence. The existing visual demo callbacks still need the exact changes in `UI_HANDOFF.md`; ordinary `ASSISTANCE_DENIED` must not be reused to trigger this scenario. Do not describe the visual demo as complete until the UI teammate integrates and rehearses it.
