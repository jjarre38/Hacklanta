import type { Resource } from "@/types";

// Metro Atlanta resource dataset (demo).
//
// Organizations are real, but contact details, eligibility summaries,
// availability `status`, and `typicalAmount` were compiled for a hackathon demo
// and have NOT been verified with each organization. The UI labels this data as
// demo data and tells users to confirm directly. `status` values other than
// UNKNOWN are simulated to show how availability affects matching.
//
// `countiesServed` is the primary matching field. To expand to new areas, add
// counties in lib/data/serviceArea.ts and list them here.

const ALL = ["Fulton", "DeKalb", "Cobb", "Gwinnett", "Clayton"];
const REVIEWED = "2026-10-01";

export const RESOURCES: Resource[] = [
  // ---------------------------------------------------------------- Legal aid
  {
    id: "atlanta-legal-aid",
    name: "Atlanta Legal Aid Society",
    category: "EVICTION_LEGAL_AID",
    secondaryCategories: ["PUBLIC_BENEFITS"],
    countiesServed: ALL,
    phone: "404-524-5811",
    website: "https://atlantalegalaid.org",
    eligibilitySummary:
      "Free civil legal help for low-income residents of Fulton, DeKalb, Cobb, Gwinnett, and Clayton counties, including eviction defense and housing conditions.",
    applicationMethod: "Call the intake line or apply online. Have your court papers and lease ready.",
    status: "OPEN",
    lastVerified: REVIEWED,
    requiresEvictionFiling: false,
  },
  {
    id: "avlf-safe-stable-homes",
    name: "Atlanta Volunteer Lawyers Foundation — Safe & Stable Homes",
    category: "EVICTION_LEGAL_AID",
    countiesServed: ["Fulton"],
    phone: "404-521-0790",
    website: "https://avlf.org",
    eligibilitySummary:
      "Volunteer attorneys help tenants with eviction cases and unsafe housing conditions, with a focus on families with children in Fulton County.",
    applicationMethod: "Call the intake line; tell them your court date if you have one.",
    status: "OPEN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "georgia-legal-aid-org",
    name: "GeorgiaLegalAid.org — Self-Help Library",
    category: "EVICTION_LEGAL_AID",
    countiesServed: ALL,
    website: "https://www.georgialegalaid.org",
    eligibilitySummary:
      "Free plain-language guides and court forms about Georgia evictions (dispossessory cases), answering a case, and tenant rights. Available to anyone.",
    applicationMethod: "Browse online — no application needed.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },

  // -------------------------------------------------------- Rental assistance
  {
    id: "ga-dca-rental",
    name: "Georgia Department of Community Affairs — Housing Assistance",
    category: "RENTAL_ASSISTANCE",
    countiesServed: ALL,
    website: "https://www.dca.ga.gov",
    eligibilitySummary:
      "State housing programs for low- and moderate-income Georgians. Emergency rental funds open and close as funding allows.",
    applicationMethod: "Check the DCA website for currently open programs and application portals.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    typicalAmount: 0,
  },
  {
    id: "atlanta-housing-community-dev",
    name: "City of Atlanta — Office of Housing & Community Development",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["AFFORDABLE_HOUSING"],
    countiesServed: ["Fulton", "DeKalb"],
    website: "https://www.atlantaga.gov/government/departments/city-planning/office-of-housing-community-development",
    eligibilitySummary:
      "City of Atlanta residents may qualify for housing stability and anti-displacement programs, depending on income and current funding.",
    applicationMethod: "Visit the website for open programs or call the office.",
    status: "FUNDS_LIMITED",
    lastVerified: REVIEWED,
    typicalAmount: 800,
  },
  {
    id: "fulton-emergency-rental",
    name: "Fulton County Department of Community Development — Rental Assistance",
    category: "RENTAL_ASSISTANCE",
    countiesServed: ["Fulton"],
    website: "https://www.fultoncountyga.gov",
    eligibilitySummary:
      "Fulton County households facing eviction may qualify for one-time help with past-due rent when funds are available.",
    applicationMethod: "Apply through the county's online portal or call 2-1-1 for referral.",
    status: "OPEN",
    lastVerified: REVIEWED,
    typicalAmount: 1000,
  },
  {
    id: "dekalb-community-dev",
    name: "DeKalb County Community Development — Emergency Assistance",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["UTILITY_ASSISTANCE"],
    countiesServed: ["DeKalb"],
    website: "https://www.dekalbcountyga.gov/community-development",
    eligibilitySummary:
      "DeKalb residents with low incomes may qualify for one-time rent or utility help to prevent homelessness.",
    applicationMethod: "Check the website for open application windows.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
    typicalAmount: 900,
  },
  {
    id: "cobb-community-dev",
    name: "Cobb County Community Development — Housing Stability",
    category: "RENTAL_ASSISTANCE",
    countiesServed: ["Cobb"],
    website: "https://www.cobbcounty.org/community-development",
    eligibilitySummary:
      "Cobb County residents may qualify for homelessness prevention funds (rent and deposits) through partner agencies.",
    applicationMethod: "Call 2-1-1 or contact the county office for current partner agencies.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    typicalAmount: 700,
  },
  {
    id: "homefirst-gwinnett",
    name: "HomeFirst Gwinnett",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["SECURITY_DEPOSIT_ASSISTANCE", "TEMPORARY_HOUSING"],
    countiesServed: ["Gwinnett"],
    website: "https://www.homefirstgwinnett.org",
    eligibilitySummary:
      "Gwinnett households at risk of or experiencing homelessness may get help with rent, deposits, and housing navigation.",
    applicationMethod: "Contact the HomeFirst Gwinnett resource center.",
    status: "OPEN",
    lastVerified: REVIEWED,
    typicalAmount: 800,
  },
  {
    id: "clayton-cccsa",
    name: "Clayton County Community Services Authority",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["UTILITY_ASSISTANCE", "FOOD_ASSISTANCE"],
    countiesServed: ["Clayton"],
    website: "https://www.cccsa.net",
    eligibilitySummary:
      "Clayton County residents with low incomes may qualify for emergency rent, utility (LIHEAP), and food help.",
    applicationMethod: "Call to schedule an appointment; bring ID, proof of income, and your lease.",
    status: "FUNDS_LIMITED",
    lastVerified: REVIEWED,
    typicalAmount: 600,
  },
  {
    id: "salvation-army-atlanta",
    name: "The Salvation Army — Metro Atlanta",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["UTILITY_ASSISTANCE", "EMERGENCY_SHELTER", "FOOD_ASSISTANCE"],
    countiesServed: ALL,
    website: "https://southernusa.salvationarmy.org/metro-atlanta",
    eligibilitySummary:
      "Emergency financial help with rent and utilities (including Project SHARE energy assistance), food pantry, and emergency shelter at some locations.",
    applicationMethod: "Contact your nearest corps community center; help is often first-come, first-served.",
    status: "OPEN",
    lastVerified: REVIEWED,
    typicalAmount: 400,
    servesFamiliesWithChildren: true,
  },
  {
    id: "svdp-georgia",
    name: "St. Vincent de Paul Georgia",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["UTILITY_ASSISTANCE", "FOOD_ASSISTANCE"],
    countiesServed: ALL,
    website: "https://svdpgeorgia.org",
    eligibilitySummary:
      "Neighbor-to-neighbor help with rent and utilities through local parish conferences, plus food pantries.",
    applicationMethod: "Call the help line or apply online; a volunteer may visit or call you.",
    status: "OPEN",
    lastVerified: REVIEWED,
    typicalAmount: 350,
  },
  {
    id: "must-ministries",
    name: "MUST Ministries",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["FOOD_ASSISTANCE", "EMERGENCY_SHELTER", "EMPLOYMENT_ASSISTANCE"],
    countiesServed: ["Cobb"],
    website: "https://www.mustministries.org",
    eligibilitySummary:
      "Cobb County neighbors can get food, emergency shelter, employment services, and limited housing assistance.",
    applicationMethod: "Visit a MUST location or call for an intake appointment.",
    status: "OPEN",
    lastVerified: REVIEWED,
    typicalAmount: 300,
    servesFamiliesWithChildren: true,
  },

  // -------------------------------------------------------- Utility assistance
  {
    id: "liheap-community-action",
    name: "LIHEAP Energy Assistance (via local Community Action Agencies)",
    category: "UTILITY_ASSISTANCE",
    countiesServed: ALL,
    website: "https://dhs.georgia.gov/liheap",
    eligibilitySummary:
      "Federally funded help paying heating and cooling bills for low-income households. Seniors and homebound residents often get first access each season.",
    applicationMethod: "Apply through your county's community action agency during the open season.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
  },
  {
    id: "georgia-power-assistance",
    name: "Georgia Power — Payment Assistance & Project SHARE",
    category: "UTILITY_ASSISTANCE",
    countiesServed: ALL,
    website: "https://www.georgiapower.com",
    eligibilitySummary:
      "Payment arrangements, extensions, and Project SHARE emergency energy funds for Georgia Power customers facing hardship.",
    applicationMethod: "Call customer service or sign in online to request a payment arrangement.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "southern-company-gas",
    name: "Atlanta Gas Light / Gas Marketers — Assistance Programs",
    category: "UTILITY_ASSISTANCE",
    countiesServed: ALL,
    website: "https://www.atlantagaslight.com",
    eligibilitySummary:
      "Natural gas customers may qualify for payment plans through their gas marketer and Project SHARE emergency help.",
    applicationMethod: "Contact your gas marketer about payment arrangements; ask about Project SHARE.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
  },

  // ------------------------------------------------------------------- Food
  {
    id: "atlanta-community-food-bank",
    name: "Atlanta Community Food Bank",
    category: "FOOD_ASSISTANCE",
    countiesServed: ALL,
    phone: "404-892-9822",
    website: "https://www.acfb.org",
    eligibilitySummary:
      "Find free groceries at partner food pantries across Metro Atlanta. Most pantries require no paperwork.",
    applicationMethod: "Use the online Food Finder to locate a pantry near your ZIP code.",
    status: "OPEN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },

  // --------------------------------------------------------- Public benefits
  {
    id: "united-way-211",
    name: "United Way of Greater Atlanta — 2-1-1",
    category: "PUBLIC_BENEFITS",
    secondaryCategories: ["RENTAL_ASSISTANCE", "UTILITY_ASSISTANCE", "FOOD_ASSISTANCE"],
    countiesServed: ALL,
    phone: "211",
    website: "https://211online.unitedwayatlanta.org",
    eligibilitySummary:
      "Free, confidential help finding rent, utility, food, and other assistance programs that are currently open. Available 24/7.",
    applicationMethod: "Dial 2-1-1 or search online.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "georgia-gateway",
    name: "Georgia Gateway — SNAP, Medicaid, TANF, WIC",
    category: "PUBLIC_BENEFITS",
    secondaryCategories: ["FOOD_ASSISTANCE", "CHILDCARE_FAMILY"],
    countiesServed: ALL,
    website: "https://gateway.ga.gov",
    eligibilitySummary:
      "Apply for food benefits (SNAP), health coverage (Medicaid/PeachCare), cash assistance (TANF), and WIC. Eligibility is based on income and household size.",
    applicationMethod: "Apply online at Georgia Gateway or at your county DFCS office.",
    status: "OPEN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },

  // ------------------------------------------- Emergency shelter / temporary
  {
    id: "gateway-center",
    name: "Gateway Center",
    category: "EMERGENCY_SHELTER",
    secondaryCategories: ["TEMPORARY_HOUSING", "EMPLOYMENT_ASSISTANCE"],
    countiesServed: ["Fulton", "DeKalb"],
    phone: "404-215-6600",
    website: "https://www.gatewayctr.org",
    eligibilitySummary:
      "Atlanta's front door for people experiencing homelessness: emergency housing, case management, and connections to permanent housing.",
    applicationMethod: "Walk in during intake hours or call ahead.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "nicholas-house",
    name: "Nicholas House",
    category: "TEMPORARY_HOUSING",
    secondaryCategories: ["EMERGENCY_SHELTER", "SECURITY_DEPOSIT_ASSISTANCE"],
    countiesServed: ["Fulton", "DeKalb"],
    website: "https://www.nicholashouse.org",
    eligibilitySummary:
      "Shelter and rapid re-housing for families with children experiencing homelessness, including help moving into a new home.",
    applicationMethod: "Families are usually referred through the Coordinated Entry system — call 2-1-1 or Gateway Center.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
    typicalAmount: 0,
  },
  {
    id: "decatur-coop-ministry",
    name: "Decatur Cooperative Ministry",
    category: "TEMPORARY_HOUSING",
    secondaryCategories: ["EMERGENCY_SHELTER", "FOOD_ASSISTANCE"],
    countiesServed: ["DeKalb"],
    website: "https://www.decaturcooperativeministry.org",
    eligibilitySummary:
      "Emergency shelter and supportive housing for women and families with children in DeKalb County, plus homelessness prevention support.",
    applicationMethod: "Call the main office to ask about current openings.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "rainbow-village",
    name: "Rainbow Village",
    category: "TEMPORARY_HOUSING",
    secondaryCategories: ["CHILDCARE_FAMILY"],
    countiesServed: ["Gwinnett"],
    website: "https://www.rainbowvillage.org",
    eligibilitySummary:
      "Transitional housing with wraparound services for families with children experiencing homelessness in Gwinnett and North Metro Atlanta.",
    applicationMethod: "Apply online; programs have limited openings.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "calvary-refuge",
    name: "Calvary Refuge Center",
    category: "TEMPORARY_HOUSING",
    secondaryCategories: ["EMERGENCY_SHELTER"],
    countiesServed: ["Clayton", "Fulton"],
    website: "https://www.calvaryrefuge.org",
    eligibilitySummary:
      "Transitional housing for families and individuals working toward stable housing in the south metro area.",
    applicationMethod: "Call to complete a phone screening.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "atlanta-mission",
    name: "Atlanta Mission",
    category: "EMERGENCY_SHELTER",
    countiesServed: ["Fulton", "DeKalb", "Cobb", "Gwinnett", "Clayton"],
    website: "https://atlantamission.org",
    eligibilitySummary:
      "Emergency shelter for men, women, and children, with longer-term recovery and job-readiness programs.",
    applicationMethod: "Visit an intake location; no appointment needed for emergency shelter.",
    status: "OPEN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },

  // ------------------------------------------------------ Affordable housing
  {
    id: "georgia-housing-search",
    name: "GeorgiaHousingSearch.org",
    category: "AFFORDABLE_HOUSING",
    countiesServed: ALL,
    website: "https://www.georgiahousingsearch.org",
    eligibilitySummary:
      "Free statewide listing service for affordable rental housing. Search by rent, bedrooms, accessibility, and whether landlords accept vouchers.",
    applicationMethod: "Search listings online and contact landlords directly.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "atlanta-housing",
    name: "Atlanta Housing",
    category: "AFFORDABLE_HOUSING",
    countiesServed: ["Fulton", "DeKalb"],
    website: "https://www.atlantahousing.org",
    eligibilitySummary:
      "Public housing, mixed-income communities, and Housing Choice Vouchers for eligible City of Atlanta residents. Waitlists open periodically.",
    applicationMethod: "Watch the website for waitlist openings and apply online.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
  },
  {
    id: "dekalb-housing-authority",
    name: "Housing Authority of DeKalb County",
    category: "AFFORDABLE_HOUSING",
    countiesServed: ["DeKalb"],
    website: "https://www.dekalbhousing.org",
    eligibilitySummary: "Public housing and Housing Choice Vouchers for eligible DeKalb County households.",
    applicationMethod: "Apply online when waitlists are open.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
  },
  {
    id: "marietta-housing-authority",
    name: "Marietta Housing Authority",
    category: "AFFORDABLE_HOUSING",
    countiesServed: ["Cobb"],
    website: "https://www.mariettahousing.org",
    eligibilitySummary: "Affordable housing and voucher programs serving Marietta and Cobb County.",
    applicationMethod: "Check the website for open waitlists.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
  },
  {
    id: "partners-for-home-rrh",
    name: "Partners for HOME — Rapid Re-Housing",
    category: "SECURITY_DEPOSIT_ASSISTANCE",
    secondaryCategories: ["AFFORDABLE_HOUSING", "MOVING_ASSISTANCE"],
    countiesServed: ["Fulton", "DeKalb"],
    website: "https://partnersforhome.org",
    eligibilitySummary:
      "City of Atlanta's homelessness response. Rapid re-housing programs may cover deposits, first month's rent, and short-term rental help.",
    applicationMethod: "Access through Coordinated Entry — call 2-1-1 or visit Gateway Center.",
    status: "FUNDS_LIMITED",
    lastVerified: REVIEWED,
    typicalAmount: 1200,
  },
  {
    id: "metro-deposit-assistance",
    name: "Community Deposit Assistance (via 2-1-1)",
    category: "SECURITY_DEPOSIT_ASSISTANCE",
    countiesServed: ALL,
    website: "https://211online.unitedwayatlanta.org",
    eligibilitySummary:
      "Several nonprofits offer one-time help with security deposits and application fees for households moving into stable housing. 2-1-1 tracks which are open.",
    applicationMethod: "Ask 2-1-1 for deposit assistance programs open in your county.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    typicalAmount: 500,
  },

  // ------------------------------------------------------------------ Moving
  {
    id: "furniture-bank-atlanta",
    name: "Furniture Bank of Metro Atlanta",
    category: "MOVING_ASSISTANCE",
    countiesServed: ALL,
    website: "https://www.furniturebankatlanta.org",
    eligibilitySummary:
      "Free or low-cost furniture and household essentials for families moving into new homes, through referral partners.",
    applicationMethod: "Get a referral from a partner agency (case manager, shelter, or 2-1-1).",
    status: "OPEN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },

  // ------------------------------------------- Workforce / employment
  {
    id: "goodwill-north-georgia",
    name: "Goodwill of North Georgia — Career Centers",
    category: "WORKFORCE_DEVELOPMENT",
    secondaryCategories: ["EMPLOYMENT_ASSISTANCE"],
    countiesServed: ALL,
    website: "https://www.goodwillng.org",
    eligibilitySummary:
      "Free job search help, résumé support, hiring events, and short-term career training in fields like IT, healthcare, and logistics.",
    applicationMethod: "Visit a career center or register online for services.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "worksource-atlanta",
    name: "WorkSource Georgia (Atlanta Regional, Fulton, DeKalb, Cobb)",
    category: "WORKFORCE_DEVELOPMENT",
    countiesServed: ALL,
    website: "https://www.worksourcegeorgia.com",
    eligibilitySummary:
      "Federally funded (WIOA) job training scholarships, career coaching, and supportive services for job seekers and laid-off workers.",
    applicationMethod: "Find your local WorkSource office and attend an orientation.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "georgia-dol",
    name: "Georgia Department of Labor — Career Centers & Unemployment",
    category: "EMPLOYMENT_ASSISTANCE",
    countiesServed: ALL,
    website: "https://dol.georgia.gov",
    eligibilitySummary:
      "File for unemployment benefits if your hours or job were cut, and use free job search services and listings (EmployGeorgia).",
    applicationMethod: "Apply online; visit a career center for in-person help.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "urban-league-atlanta",
    name: "Urban League of Greater Atlanta",
    category: "EMPLOYMENT_ASSISTANCE",
    secondaryCategories: ["WORKFORCE_DEVELOPMENT"],
    countiesServed: ALL,
    website: "https://ulgatl.org",
    eligibilitySummary:
      "Workforce training, job placement, and financial coaching for adults and young adults across Metro Atlanta.",
    applicationMethod: "Register online for programs and information sessions.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
  },

  // ---------------------------------------------------- Childcare & family
  {
    id: "ga-caps",
    name: "Georgia CAPS Childcare Subsidy (DECAL)",
    category: "CHILDCARE_FAMILY",
    countiesServed: ALL,
    website: "https://caps.decal.ga.gov",
    eligibilitySummary:
      "Helps working families with low incomes pay for childcare. Families experiencing homelessness or at risk may receive priority.",
    applicationMethod: "Apply online through the CAPS portal.",
    status: "OPEN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "chris-180",
    name: "CHRIS 180",
    category: "CHILDCARE_FAMILY",
    secondaryCategories: ["TEMPORARY_HOUSING"],
    countiesServed: ["Fulton", "DeKalb", "Clayton", "Gwinnett"],
    phone: "404-486-9034",
    website: "https://chris180.org",
    eligibilitySummary:
      "Family counseling, youth services, and supportive housing programs for children, youth, and families who have experienced trauma or instability.",
    applicationMethod: "Call the main line to be connected with the right program.",
    status: "OPEN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "ymca-metro-atlanta",
    name: "YMCA of Metro Atlanta — Family Support & Childcare",
    category: "CHILDCARE_FAMILY",
    countiesServed: ALL,
    website: "https://ymcaatlanta.org",
    eligibilitySummary:
      "Early learning, afterschool, and summer programs with income-based financial assistance; community programs for families in transition.",
    applicationMethod: "Contact your local branch and ask about financial assistance.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
];

export function getResourceById(id: string): Resource | undefined {
  return RESOURCES.find((r) => r.id === id);
}
