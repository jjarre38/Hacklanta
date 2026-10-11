# Georgia legal-information review

Source check: **October 10, 2026**. This is an engineering review of general information, not attorney approval. HomePath does not determine service dates, calculate legal filing deadlines, predict court outcomes, or provide representation.

## Evidence and corrections

| Subject | Direct evidence | Result |
|---|---|---|
| Nonpayment notice and Safe at Home applicability | [Official Georgia Code 2025 supplement](https://www.legis.ga.gov/api/document/docs/default-source/joint-features-document-library/t44-ch1-7-(v31)-pdf.pdf), PDF pp. 173–174 (§44-7-50 and applicability note) | Added lease-entry/renewal applicability from July 1, 2024 to the three-business-day notice explanation. Other protections may require more notice. |
| Answer after service | [Fulton Magistrate dispossessory guidance](https://www.magistratefulton.org/165/Landlord-Tenant-Dispossessory), [official summons form](https://fultonclerk.org/DocumentCenter/View/657/Dispossessory-Affidavit) | Seven-day general answer rule; added weekend/holiday exception and direction to check the summons. No deadline inferred from the hearing date. |
| Full tender | [Georgia Legal Aid eviction explanation](https://www.georgialegalaid.org/resource/what-to-know-about-evictions), [answer guide](https://www.georgialegalaid.org/resource/how-to-answer-a-dispossessory) | Removed “assistance approvals can sometimes count.” Approval is not actual tender. Full payment requirements, timing, prior use, and refusal need legal review. These pages were available through search extracts; direct retrieval of the first returned 502. |
| Writ and appeal | [Fulton petition-for-review instructions](https://www.magistratefulton.org/DocumentCenter/View/2210/Petition-for-Review-Appeals), [Fulton FAQs](https://www.magistratefulton.org/m/faq?cat=16), official Code §§44-7-55/56 | Removed ambiguous “about how long.” Distinguished contested judgment timing from default procedures; retained urgent appeal guidance and cautioned that filing alone does not guarantee continued possession. |
| Physical removal | Official Code §§44-7-14.1, 44-7-50, 44-7-55; [Georgia Legal Aid illegal evictions](https://www.georgialegalaid.org/resource/illegal-evictions) | Replaced “only sheriff or marshal” with lawful court process/execution; statute allows other authorized execution arrangements. Utility provision alone is not cited as the entire lockout rule. |
| Repairs, retaliation, deposits | Official Code §§44-7-13, 44-7-24, 44-7-30.1 and applicability notes | Added applicability and exceptions; retaliation protection does not automatically excuse nonpayment. These are issue-spotting statements, not affirmative findings for a user. |
| Hearing / mediation | Fulton court guidance above | Replaced “wins automatically” with risk of adverse judgment; mediation availability is a question for the court, not a guarantee. |
| Legal and emergency referrals | [Atlanta Legal Aid intake](https://atlantalegalaid.org/get-help-2/), [United Way 211](https://unitedwayatlanta.org/about-211/), [Gateway schedule](https://www.gatewayctr.org/schedule/) | Legal services require intake; removed blanket 24/7 staffed-211 claim and guaranteed emergency-placement implications. |

`lib/data/rightsContent.ts` keeps its existing card IDs/anchors and stage mappings. `lastReviewed` is the date sources were checked, not a claim of attorney certification. Actions in `recommendationService.ts` retain legal guidance during recovery and direct users to qualified help.

## Limits requiring human review

- The official legislative PDF explicitly covers the **2025** legislative session; this is not proof that no 2026 amendment or new case law affects a particular tenancy. The DCA handbook landing page was accessible, but its linked PDF download could not be retrieved through the research tool. Its full text was not certified as checked.
- Legal Aid search extracts corroborate tender concepts, but failed direct retrieval limits validation. An attorney should review tender amounts, fees, the once-in-12-month rule, rejected payments, and the statement that payment can end a nonpayment case.
- Review federal/subsidized-housing notice protections, service defects, actual lease dates, defaults, appeal service requirements, registry payments, writ execution, military protections, bankruptcy, tenant-screening remedies, and hotel/mobile-home distinctions before relying on personalized guidance. Intake deliberately does not collect enough facts to decide these issues.
- Existing screening-report/dismissal guidance remains general and needs legal review. A dismissal does not guarantee record removal or approval by a new landlord.
- The fictional sample notice must remain labeled. Its dates, courthouse details, and answer text are not a court form for real filing.

Court urgency and recovery priority now coexist. Judgment, denial, and rejection never constitute an engine finding that legal options are exhausted. `daysUntil` measures Atlanta calendar days for prioritization only; it does not implement Georgia deadline computation or holiday rules.

Additional action-text check: [Georgia enrollment rule 160-5-1-.28](https://apps.gadoe.org/sboe/SBOE%20Rules/160-5-1-.28.pdf) ties homeless-student protections to McKinney-Vento eligibility. Recovery guidance now asks the school liaison to assess the living situation rather than promising protections for every move. Employment and 211 actions also avoid unsupported promises of paid training or current funds.
