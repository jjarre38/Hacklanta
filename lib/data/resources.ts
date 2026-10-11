import type { Resource } from "@/types";

// Reviewed official sources, checked 2026-10-10. These are referral opportunities,
// never individual eligibility decisions or evidence that funding/beds are available.
const ALL = ["Fulton", "DeKalb", "Cobb", "Gwinnett", "Clayton"];
const REVIEWED = "2026-10-10";
const resource = (r: Omit<Resource, "lastVerified" | "status"> & { status?: Resource["status"] }): Resource => ({
  status: "UNKNOWN", lastVerified: REVIEWED, ...r,
  sourceUrl: r.sourceUrl ?? r.website,
  verificationNotes: r.verificationNotes ?? "Official service/contact information checked. Household eligibility, application capacity, funding, and placement must be confirmed directly.",
});

export const RESOURCES: Resource[] = [
  resource({
    id: "avlf-safe-stable-homes", name: "AVLF — Eviction Defense and Housing Phone Bank", category: "EVICTION_LEGAL_AID", countiesServed: ["Fulton"],
    website: "https://avlf.org/get-help/", sourceUrl: "https://avlf.org/programs/eviction-defense/",
    requiresEvictionFiling: true, restrictionSourceUrl: "https://avlf.org/programs/eviction-defense/",
    eligibilitySummary: "Help for low-income, unrepresented tenants facing pending eviction. Full representation and the Atlanta pilot have additional screening and geographic limits.",
    applicationMethod: "Use AVLF's Get Help page to request eviction support. Confirm eligibility, response time, and whether representation is offered.",
  }),
  resource({
    id: "gwinnett-one-stop", name: "Gwinnett County — One Stop for Help", category: "PUBLIC_BENEFITS", secondaryCategories: ["AFFORDABLE_HOUSING", "FOOD_ASSISTANCE", "TEMPORARY_HOUSING"], countiesServed: ["Gwinnett"],
    website: "https://www.gwinnettcounty.com/government/departments/community-services/health-human-services/one-stop-help", phone: "770-822-8850",
    eligibilitySummary: "Community navigators connect Gwinnett residents to housing, food, and other support. This is navigation, not a guaranteed cash award.",
    applicationMethod: "Call, submit the official assistance request form, or email OneStopHelp@GwinnettCounty.com.",
  }),
  resource({
    id: "duluth-coop-food", name: "Duluth Co-op — Food Appointments", category: "FOOD_ASSISTANCE", countiesServed: ["Gwinnett"], zipCodesServed: ["30096", "30097"],
    website: "https://duluthco-op.org/calendar/", restrictionSourceUrl: "https://duluthco-op.org/calendar/",
    eligibilitySummary: "Food appointments for residents of ZIP codes 30096 and 30097. Confirm documentation and appointment availability.",
    applicationMethod: "Use the current client appointment portal on the official calendar page.",
    verificationNotes: "Current portal publishes the ZIP restriction. Old rent award amounts on an archived services page were deliberately not used.",
  }),
  resource({
    id: "clayton-cccsa", name: "Clayton County Community Services Authority", category: "RENTAL_ASSISTANCE", secondaryCategories: ["UTILITY_ASSISTANCE", "FOOD_ASSISTANCE", "CHILDCARE_FAMILY"], countiesServed: ["Clayton"],
    website: "https://claytoncountycsa.org/office-of-community-support", sourceUrl: "https://claytoncountycsa.org/contact-us", phone: "404-363-0575",
    eligibilitySummary: "Community action support for qualifying households. Ask which rent, utility, food, or family programs currently accept applications and serve your address.",
    applicationMethod: "Call the main number and select option 2 for rent, utilities, food, and LIHEAP information. Verify required documents before visiting.",
  }),
  resource({
    id: "atlanta-legal-aid", name: "Atlanta Legal Aid Society", category: "EVICTION_LEGAL_AID", countiesServed: ALL,
    website: "https://atlantalegalaid.org/get-help-2/", phone: "404-524-5811",
    eligibilitySummary: "Civil legal help for people meeting income and case criteria in the five metro counties. Representation is not guaranteed. This is not a rental-assistance fund.",
    applicationMethod: "Apply online or call your county office: Fulton 404-524-5811; Clayton 404-669-0233; Cobb 770-528-2565; DeKalb 404-377-0701; Gwinnett 678-376-4545.",
  }),
  resource({
    id: "svdp-georgia", name: "St. Vincent de Paul Georgia — Local Assistance", category: "RENTAL_ASSISTANCE", secondaryCategories: ["UTILITY_ASSISTANCE", "FOOD_ASSISTANCE"], countiesServed: ALL,
    website: "https://svdpgeorgia.org/get-help/", phone: "678-892-6163",
    eligibilitySummary: "Assistance depends on your local volunteer conference and available funds. ZIP routing does not establish eligibility or funding.",
    applicationMethod: "Call the assistance line and enter your ZIP to reach the local conference. Ask about rent, utilities, and food.",
  }),
  resource({
    id: "liheap-community-action", name: "Georgia LIHEAP — Energy Assistance", category: "UTILITY_ASSISTANCE", countiesServed: ALL,
    website: "https://dfcs.georgia.gov/regular-home-energy-assistance",
    eligibilitySummary: "Energy assistance has household and income criteria, seasonal intake, and local agency capacity limits. Current openings have not been confirmed.",
    applicationMethod: "Use the official How To Apply link to locate the community action agency for your county and confirm intake dates.",
  }),
  resource({
    id: "atlanta-community-food-bank", name: "Atlanta Community Food Bank — Food Finder", category: "FOOD_ASSISTANCE", secondaryCategories: ["PUBLIC_BENEFITS"], countiesServed: ALL,
    website: "https://www.acfb.org/get-help/", servesFamiliesWithChildren: true,
    eligibilitySummary: "Find nearby partner pantries or request help with benefit applications. Each site has its own hours and requirements.",
    applicationMethod: "Use the food map or Text for Help instructions on the official page; confirm the pantry's hours before traveling.",
  }),
  resource({
    id: "united-way-211", name: "United Way of Greater Atlanta — 2-1-1 Referrals", category: "PUBLIC_BENEFITS",
    secondaryCategories: ["RENTAL_ASSISTANCE", "EMERGENCY_SHELTER", "TEMPORARY_HOUSING", "SECURITY_DEPOSIT_ASSISTANCE", "CHILDCARE_FAMILY"], countiesServed: ALL,
    website: "https://unitedwayatlanta.org/about-211/", phone: "211",
    eligibilitySummary: "Information and referral service, not a cash award or guaranteed placement. Ask which programs serve your exact location and household.",
    applicationMethod: "Call 211 or use the official online directory/chat to ask about shelter, move-in support, benefits, and family needs.",
    verificationNotes: "Referral channels verified; no current funding, beds, or deposit award verified. Secondary categories describe referral needs, not direct services.",
  }),
  resource({
    id: "georgia-gateway", name: "Georgia Gateway — Benefit Applications", category: "PUBLIC_BENEFITS", secondaryCategories: ["FOOD_ASSISTANCE", "CHILDCARE_FAMILY"], countiesServed: ALL,
    website: "https://gateway.ga.gov", sourceUrl: "https://georgia.gov/georgia-gateway",
    eligibilitySummary: "State portal for SNAP, TANF, medical assistance, CAPS and other programs. Each program makes its own eligibility decision.",
    applicationMethod: "Use Georgia Gateway to apply and check application status; the official Georgia.gov guide explains the portal.",
  }),
  resource({
    id: "gateway-center", name: "Gateway Center — Engagement and Housing Referrals", category: "TEMPORARY_HOUSING", secondaryCategories: ["EMERGENCY_SHELTER"], countiesServed: ["Fulton", "DeKalb"],
    website: "https://www.gatewayctr.org/client-engagement-center/", servesFamiliesWithChildren: true,
    eligibilitySummary: "Atlanta engagement and coordinated-entry access for people experiencing homelessness, including families. County matching is only a first screen; confirm the appropriate local homeless response system and family services.",
    applicationMethod: "Consult Gateway's current service schedule and ask for coordinated-entry assessment. Do not assume a family bed or same-day placement.",
  }),
  resource({
    id: "partners-for-home-rrh", name: "Partners for HOME — Atlanta Coordinated Entry", category: "AFFORDABLE_HOUSING", secondaryCategories: ["TEMPORARY_HOUSING", "SECURITY_DEPOSIT_ASSISTANCE"], countiesServed: ["Fulton", "DeKalb"],
    website: "https://partnersforhome.org/ova_sev/coordinated-entry/",
    eligibilitySummary: "City of Atlanta homeless response system. Assessment may lead to housing referrals; county residence alone is insufficient. Rapid rehousing or move-in help depends on assessment and capacity.",
    applicationMethod: "Use the listed coordinated-entry access points or email coordinatedentry@partnersforhome.org for guidance. Ask 211 for the correct system outside Atlanta.",
    verificationNotes: "City jurisdiction and assessment route verified; no deposit amount, referral acceptance, or vacancy confirmed.",
  }),
  resource({
    id: "georgia-housing-search", name: "GeorgiaHousingSearch.org", category: "AFFORDABLE_HOUSING", countiesServed: ALL,
    website: "https://www.georgiahousingsearch.org", phone: "877-428-8844",
    sourceUrl: "https://dca.georgia.gov/housing-choice-voucher/housing-choice-voucher/georgia-housing-search",
    eligibilitySummary: "Free rental listing search. Listings are not reservations, eligibility approval, or proof of a current vacancy.",
    applicationMethod: "Search by location and budget or call the listing help line; contact each property to verify rent, vacancy, and screening rules.",
  }),
  resource({
    id: "furniture-bank-atlanta", name: "Furniture Bank of Metro Atlanta", category: "MOVING_ASSISTANCE", countiesServed: ALL,
    website: "https://furniturebankatlanta.org/get-help/get-furniture/", phone: "404-355-8530",
    eligibilitySummary: "Furniture for eligible households transitioning from homelessness, fleeing domestic violence, or living with HIV/AIDS. Approved partner referral required. Not a cash moving grant.",
    applicationMethod: "Ask your caseworker or social worker at an approved partner for a referral. No drop-in appointments.",
    verificationNotes: "Referral-only service and five-county partner directory verified; inventory, delivery coverage, and individual eligibility need confirmation.",
  }),
  resource({
    id: "goodwill-north-georgia", name: "Goodwill of North Georgia — Career Centers", category: "EMPLOYMENT_ASSISTANCE", secondaryCategories: ["WORKFORCE_DEVELOPMENT"], countiesServed: ALL,
    website: "https://www.goodwillng.org/putting-people-to-work/explore-our-career-centers/",
    eligibilitySummary: "Public career centers and online Career Connector provide free job-search help. Individual training programs may have additional requirements.",
    applicationMethod: "Find a career center or use virtual Career Connector through the official page; confirm local hours and training enrollment.",
  }),
  resource({
    id: "ga-caps", name: "Georgia CAPS — Childcare Assistance", category: "CHILDCARE_FAMILY", countiesServed: ALL, servesFamiliesWithChildren: true,
    website: "https://www.decal.ga.gov/CAPS/CAPSPolicyManualOne.aspx", phone: "833-442-2277",
    eligibilitySummary: "Childcare assistance has child, household, income, and activity requirements. Having children alone does not establish eligibility or award availability.",
    applicationMethod: "Apply through Georgia Gateway or contact CAPS for application support. Check the current policy and priority rules.",
  }),
];

export function getResourceById(id: string): Resource | undefined {
  return RESOURCES.find(r => r.id === id);
}
