import type { Resource } from "@/types";

// Metro Atlanta resource dataset (demo).
//
// Organizations, websites, phone numbers, addresses, and program descriptions
// were checked against each organization's own site (and other current public
// sources) on 2026-10-10. Programs and funding change often, so the UI still
// tells users to confirm directly.
//
// Availability `status` and `typicalAmount` are NOT verified: `status` values
// other than UNKNOWN are simulated to show how availability affects matching,
// and `typicalAmount` is a demo estimate used by the combination engine.
//
// `countiesServed` is the primary matching field. To expand to new areas, add
// counties in lib/data/serviceArea.ts and list them here.

const ALL = ["Fulton", "DeKalb", "Cobb", "Gwinnett", "Clayton"];
const REVIEWED = "2026-10-10";

export const RESOURCES: Resource[] = [
  // ---------------------------------------------------------------- Legal aid
  {
    id: "atlanta-legal-aid",
    name: "Atlanta Legal Aid Society",
    category: "EVICTION_LEGAL_AID",
    secondaryCategories: ["PUBLIC_BENEFITS"],
    countiesServed: ALL,
    address: "54 Ellis St NE, Atlanta, GA 30303",
    phone: "404-524-5811",
    website: "https://atlantalegalaid.org",
    eligibilitySummary:
      "Free civil legal help for low-income residents of Fulton, DeKalb, Cobb, Gwinnett, and Clayton counties, including eviction defense and housing conditions.",
    applicationMethod:
      "Call your county's intake line — Fulton 404-524-5811, DeKalb 404-377-0701, Cobb 770-528-2565, Gwinnett 678-376-4545, Clayton 404-669-0233. Have your court papers and lease ready.",
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
    website: "https://avlf.org/housingintake/",
    eligibilitySummary:
      "Volunteer attorneys help Fulton County tenants with eviction defense and unsafe housing conditions, including through the Housing Court Assistance Center.",
    applicationMethod: "Complete the online housing intake or call; tell them your court date if you have one.",
    status: "OPEN",
    lastVerified: REVIEWED,
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
    phone: "404-679-4840",
    website: "https://dca.georgia.gov",
    eligibilitySummary:
      "State housing programs for low- and moderate-income Georgians, including Housing Choice Vouchers and homelessness assistance. There is no statewide emergency rental program open right now; check for new funding.",
    applicationMethod: "Check the DCA website for currently open programs. Housing Choice Voucher helpline: 470-802-4707.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    typicalAmount: 0,
  },
  {
    id: "atlanta-housing-community-dev",
    name: "City of Atlanta — Housing Help Center",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["AFFORDABLE_HOUSING", "MOVING_ASSISTANCE"],
    countiesServed: ["Fulton", "DeKalb"],
    address: "2 Peachtree St, 1st Floor, Atlanta, GA 30303",
    phone: "404-492-7640",
    website: "https://www.housinghelpcenter.com",
    eligibilitySummary:
      "City-run help for Atlanta residents: referrals for rent and utility assistance, relocation help, legal aid, and eviction diversion. Prioritizes households at or below 60% of area median income within city limits.",
    applicationMethod: "Call, dial 3-1-1, or visit the center in person.",
    status: "FUNDS_LIMITED",
    lastVerified: REVIEWED,
    typicalAmount: 800,
  },
  {
    id: "fulton-emergency-rental",
    name: "Fulton County Community Development — Homelessness Prevention",
    category: "RENTAL_ASSISTANCE",
    countiesServed: ["Fulton"],
    address: "141 Pryor St SW, Atlanta, GA 30303",
    phone: "404-612-4000",
    website:
      "https://www.fultoncountyga.gov/inside-fulton-county/fulton-county-departments/community-development/housing-and-urban-development-funded-programs",
    eligibilitySummary:
      "Federally funded homelessness prevention and rapid re-housing through county partner agencies. Residents of Roswell, Sandy Springs, South Fulton, and Johns Creek are served by their own city programs instead.",
    applicationMethod: "Call 2-1-1 or the department to be referred to a partner agency with open funds.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    typicalAmount: 1000,
  },
  {
    id: "dekalb-community-dev",
    name: "DeKalb County Community Development — Housing Assistance",
    category: "RENTAL_ASSISTANCE",
    countiesServed: ["DeKalb"],
    phone: "404-371-2727",
    website: "https://dekalbcountyga.gov/departments/community-development",
    eligibilitySummary:
      "DeKalb residents with low incomes may qualify for county housing assistance programs and homeless services through DeKalb's Coordinated Entry system.",
    applicationMethod: "Check the website for open application windows. For homelessness or housing crises, call DeKalb Coordinated Entry at 404-687-3500.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
    typicalAmount: 900,
  },
  {
    id: "cobb-community-dev",
    name: "Cobb County CDBG Program Office — Homelessness Prevention",
    category: "RENTAL_ASSISTANCE",
    countiesServed: ["Cobb"],
    address: "192 Anderson St, Suite 150, Marietta, GA 30060",
    phone: "770-528-1455",
    website: "https://findhelp.cobbcounty.gov",
    eligibilitySummary:
      "Cobb County residents may qualify for federally funded homelessness prevention help (rent and deposits) through the county's partner agencies.",
    applicationMethod: "Call 2-1-1 or the CDBG Program Office for current partner agencies.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    typicalAmount: 700,
  },
  {
    id: "homefirst-gwinnett",
    name: "Gwinnett Coordinated Entry — Latin American Association Outreach Center",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["TEMPORARY_HOUSING"],
    countiesServed: ["Gwinnett"],
    address: "5320 Jimmy Carter Blvd, Norcross, GA 30093",
    phone: "678-205-1018",
    website: "https://thelaa.org/gwinnett/",
    eligibilitySummary:
      "Gwinnett's housing crisis assessment center for households at risk of or experiencing homelessness. Referrals for rent and utility help when funds are available.",
    applicationMethod: "Call or visit for a Coordinated Entry assessment. You can also call 2-1-1 or Gwinnett OneStop 4 Help.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    typicalAmount: 800,
  },
  {
    id: "clayton-cccsa",
    name: "Clayton County Community Services Authority",
    category: "UTILITY_ASSISTANCE",
    secondaryCategories: ["FOOD_ASSISTANCE"],
    countiesServed: ["Clayton"],
    address: "1000 Main St, Forest Park, GA 30297",
    phone: "404-363-0575",
    website: "https://claytoncountycsa.org",
    eligibilitySummary:
      "Clayton County residents with low incomes may qualify for utility help (LIHEAP) and food assistance. Rental assistance is not available at this time.",
    applicationMethod:
      "Call Mon–Fri 8:30–4:30 and press 2 for rent, mortgage, utilities, food, and LIHEAP. A case manager assigns help — the agency does not take online applications.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
  },
  {
    id: "salvation-army-atlanta",
    name: "The Salvation Army — Metro Atlanta",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["UTILITY_ASSISTANCE", "FOOD_ASSISTANCE"],
    countiesServed: ALL,
    phone: "404-486-2888",
    website:
      "https://www.salvationarmyusa.org/usa-southern-territory/georgia/metro-atlanta-area-command/financial-emergency-services/",
    eligibilitySummary:
      "Emergency financial help with rent, utilities (including Project SHARE energy assistance), and food through Financial Emergency Services Centers in every metro county.",
    applicationMethod:
      "Call to schedule an appointment at your nearest center: Atlanta (Fulton), Decatur (DeKalb), Marietta (Cobb), Lawrenceville (Gwinnett), or Jonesboro (Clayton).",
    status: "OPEN",
    lastVerified: REVIEWED,
    typicalAmount: 400,
    servesFamiliesWithChildren: true,
  },
  {
    id: "svdp-georgia",
    name: "St. Vincent de Paul Georgia",
    category: "RENTAL_ASSISTANCE",
    secondaryCategories: ["UTILITY_ASSISTANCE"],
    countiesServed: ALL,
    phone: "678-892-6163",
    website: "https://svdpgeorgia.org/get-help/",
    eligibilitySummary: "Neighbor-to-neighbor help with rent and utilities through local parish groups, as funds allow.",
    applicationMethod: "Call the Assistance Line and give your ZIP code — you'll be routed to your local parish group.",
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
    address: "1260 Cobb Pkwy N, Marietta, GA 30062",
    phone: "770-427-9862",
    website: "https://mustministries.org",
    eligibilitySummary:
      "Cobb County neighbors can get food, housing help, employment services, and healthcare support.",
    applicationMethod: "Call Client Services in Marietta, or the Smyrna location at 770-436-9514, for an intake appointment.",
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
    phone: "404-657-3426",
    website: "https://dfcs.georgia.gov/services/low-income-home-energy-assistance-program-liheap",
    eligibilitySummary:
      "Federally funded help paying heating and cooling bills for low-income households. Seniors 65+ and homebound residents get first access each season.",
    applicationMethod:
      "Apply through your county's community action agency during the open season — Partnership for Community Action (DeKalb, Gwinnett: 404-537-4300), Fulton Atlanta Community Action Authority (Fulton), Tallatoona CAP (Cobb), or Clayton County CSA (Clayton).",
    status: "WAITLIST",
    lastVerified: REVIEWED,
  },
  {
    id: "georgia-power-assistance",
    name: "Georgia Power — Payment Assistance & Project SHARE",
    category: "UTILITY_ASSISTANCE",
    countiesServed: ALL,
    phone: "888-660-5890",
    website: "https://www.georgiapower.com/our-impact/community/giving-back/project-share.html",
    eligibilitySummary:
      "Payment arrangements, an income-qualified discount, and Project SHARE emergency energy funds for Georgia Power customers facing hardship. Some areas of Cobb and Gwinnett are served by electric co-ops instead.",
    applicationMethod: "Call customer service to request a payment arrangement. Apply for Project SHARE through The Salvation Army.",
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
      "Natural gas customers may qualify for payment plans through their gas marketer and Project SHARE emergency help. Seniors 65+ with low incomes can get a monthly discount.",
    applicationMethod: "Contact your gas marketer about payment arrangements; apply for Project SHARE through The Salvation Army.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
  },

  // ------------------------------------------------------------------- Food
  {
    id: "atlanta-community-food-bank",
    name: "Atlanta Community Food Bank",
    category: "FOOD_ASSISTANCE",
    countiesServed: ALL,
    phone: "404-892-3333",
    website: "https://www.acfb.org/get-help/food-map/",
    eligibilitySummary: "Find free groceries at partner food pantries and community food centers across Metro Atlanta.",
    applicationMethod: "Use the online Food Finder, or text FINDFOOD to 888-976-2232, to locate a pantry near you.",
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
      "Free, confidential help finding rent, utility, food, and other assistance programs that are currently open. Specialists answer Mon–Fri 8am–5pm; search online anytime.",
    applicationMethod: "Dial 2-1-1 (or 404-614-1000) or search online.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "georgia-gateway",
    name: "Georgia Gateway — SNAP, Medicaid, TANF, WIC, Childcare",
    category: "PUBLIC_BENEFITS",
    secondaryCategories: ["FOOD_ASSISTANCE", "CHILDCARE_FAMILY"],
    countiesServed: ALL,
    phone: "877-423-4746",
    website: "https://gateway.ga.gov",
    eligibilitySummary:
      "Apply for food benefits (SNAP), health coverage (Medicaid), cash assistance (TANF), WIC, and CAPS childcare help. Eligibility is based on income and household size.",
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
    address: "275 Pryor St SW, Atlanta, GA 30303",
    phone: "404-215-6600",
    website: "https://www.gatewayctr.org",
    eligibilitySummary:
      "Front door to the City of Atlanta's Coordinated Entry system for people experiencing homelessness — assessments, case management, and connections to shelter and permanent housing. Its own residential programs mainly serve men.",
    applicationMethod: "Call ahead to confirm intake hours, then visit.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "nicholas-house",
    name: "Nicholas House",
    category: "TEMPORARY_HOUSING",
    secondaryCategories: ["EMERGENCY_SHELTER", "SECURITY_DEPOSIT_ASSISTANCE"],
    countiesServed: ["Fulton", "DeKalb"],
    phone: "404-622-0793",
    website: "https://nicholashouse.org",
    eligibilitySummary:
      "Emergency shelter, rapid re-housing, and homelessness prevention for families with at least one child under 18 in their custody.",
    applicationMethod:
      "Referral through Coordinated Entry only (no walk-ins): Atlanta and Fulton through Gateway Center; DeKalb by calling 404-687-3500. For same-day shelter, call 3-1-1 in Atlanta or 2-1-1 elsewhere.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
    typicalAmount: 0,
  },
  {
    id: "decatur-coop-ministry",
    name: "Decatur Cooperative Ministry",
    category: "TEMPORARY_HOUSING",
    secondaryCategories: ["EMERGENCY_SHELTER"],
    countiesServed: ["DeKalb"],
    website: "https://www.decaturcooperativeministry.org",
    eligibilitySummary:
      "Hagar's House emergency shelter (stays up to 90 days) and transitional housing across DeKalb County for families with minor children.",
    applicationMethod: "Contact the ministry to ask about current openings.",
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
    address: "3427 Duluth Hwy, Duluth, GA 30096",
    phone: "770-497-1888",
    website: "https://www.rainbowvillage.org",
    eligibilitySummary:
      "Up to two years of housing with wraparound services for families with children experiencing homelessness, plus three years of alumni support. Not an emergency shelter.",
    applicationMethod:
      "Email info@rainbowvillage.org. There's no waitlist — inquiries are considered when an apartment opens. For immediate help, call 2-1-1.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "calvary-refuge",
    name: "Calvary Refuge Center",
    category: "EMERGENCY_SHELTER",
    secondaryCategories: ["TEMPORARY_HOUSING"],
    countiesServed: ["Clayton", "Fulton", "DeKalb"],
    address: "4265 Thurman Rd, Forest Park, GA 30297",
    phone: "404-361-5309",
    website: "https://www.calvaryrefuge.org",
    eligibilitySummary:
      "21-day shelter with meals and case management for families and individuals in the south metro area. Requires a Georgia photo ID; no pets.",
    applicationMethod: "Call for a phone screening Mon–Fri 9am–1pm. Please don't walk in.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
  {
    id: "atlanta-mission",
    name: "Atlanta Mission",
    category: "EMERGENCY_SHELTER",
    countiesServed: ALL,
    phone: "404-588-4000",
    website: "https://atlantamission.org/get-help/",
    eligibilitySummary:
      "Emergency shelter in Atlanta for men (The Shepherd's Inn) and for women and children (Restoration House, My Sister's House), with longer-term recovery and job-readiness programs.",
    applicationMethod:
      "Women and children start at Restoration House (404-588-4007); men at The Shepherd's Inn (404-367-2493). Check admission requirements before you go.",
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
    phone: "877-428-8844",
    website: "https://www.georgiahousingsearch.org",
    eligibilitySummary: "Free statewide listing service for affordable rental housing, sponsored by Georgia DCA.",
    applicationMethod: "Search listings online and contact landlords directly. Call center: Mon–Fri 9am–8pm.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "atlanta-housing",
    name: "Atlanta Housing",
    category: "AFFORDABLE_HOUSING",
    countiesServed: ["Fulton", "DeKalb"],
    phone: "404-892-4700",
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
    address: "246 Sycamore St, Suite 260, Decatur, GA 30030",
    phone: "404-270-2500",
    website: "https://www.dekalbhousing.org",
    eligibilitySummary: "Public housing and Housing Choice Vouchers for eligible DeKalb County households.",
    applicationMethod: "Apply online when waitlists are open. The office is by appointment only.",
    status: "WAITLIST",
    lastVerified: REVIEWED,
  },
  {
    id: "marietta-housing-authority",
    name: "Marietta Housing Authority",
    category: "AFFORDABLE_HOUSING",
    countiesServed: ["Cobb"],
    address: "95 Cole St, Marietta, GA 30060",
    phone: "770-419-3200",
    website: "https://www.mariettahousingauthority.org",
    eligibilitySummary:
      "Housing Choice Vouchers, HUD-VASH, Family Self-Sufficiency, and affordable rental communities serving Marietta, Austell, Mableton, Powder Springs, Kennesaw, and Acworth.",
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
    phone: "311",
    website: "https://partnersforhome.org/help/",
    eligibilitySummary:
      "Part of the City of Atlanta's homelessness response. Rapid re-housing programs may cover deposits, first month's rent, and short-term rental help.",
    applicationMethod: "Access through Coordinated Entry — call 3-1-1 (or 2-1-1) or visit Gateway Center.",
    status: "FUNDS_LIMITED",
    lastVerified: REVIEWED,
    typicalAmount: 1200,
  },
  {
    id: "metro-deposit-assistance",
    name: "Community Deposit Assistance (via 2-1-1)",
    category: "SECURITY_DEPOSIT_ASSISTANCE",
    countiesServed: ALL,
    phone: "211",
    website: "https://211online.unitedwayatlanta.org",
    eligibilitySummary:
      "Several nonprofits offer one-time help with security deposits and application fees for households moving into stable housing. 2-1-1 can tell you which are open.",
    applicationMethod: "Ask 2-1-1 (or 404-614-1000) for deposit assistance programs open in your county.",
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
    address: "2179 Bouldercrest Rd SE, Atlanta, GA 30316",
    phone: "404-355-8530",
    website: "https://furniturebankatlanta.org/get-help/",
    eligibilitySummary:
      "Free furniture for people moving out of homelessness, fleeing domestic violence, or living with HIV/AIDS. Delivery beyond 25 miles costs $50. Wait times may be longer than usual.",
    applicationMethod: "Referral only — ask your case manager, shelter, or social worker to refer you. No drop-ins.",
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
    phone: "404-420-9900",
    website: "https://www.goodwillng.org",
    eligibilitySummary:
      "Free job search help, résumé support, hiring events, and short-term training in IT and skilled trades. Metro career centers are in Fulton and DeKalb, plus a Mobile Career Center.",
    applicationMethod: "Visit a career center or register online for services.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "worksource-atlanta",
    name: "WorkSource Georgia (City of Atlanta, Fulton, DeKalb, Cobb, Atlanta Regional)",
    category: "WORKFORCE_DEVELOPMENT",
    countiesServed: ALL,
    website: "https://www.tcsg.edu/worksource/",
    eligibilitySummary:
      "Federally funded (WIOA) job training scholarships, career coaching, and supportive services for job seekers and laid-off workers.",
    applicationMethod:
      "Find your local WorkSource office and attend an orientation. Gwinnett and Clayton residents use WorkSource Atlanta Regional (404-463-3327).",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "georgia-dol",
    name: "Georgia Department of Labor — Career Centers & Unemployment",
    category: "EMPLOYMENT_ASSISTANCE",
    countiesServed: ALL,
    phone: "877-709-8185",
    website: "https://dol.georgia.gov",
    eligibilitySummary:
      "File for unemployment benefits if your hours or job were cut, and use free job search services through the WorkSource Georgia portal.",
    applicationMethod:
      "File a claim through the MyUI Claimant Portal and register in the WorkSource Georgia portal (required, or benefits may be delayed). Visit a career center for in-person help.",
    status: "OPEN",
    lastVerified: REVIEWED,
  },
  {
    id: "urban-league-atlanta",
    name: "Urban League of Greater Atlanta",
    category: "EMPLOYMENT_ASSISTANCE",
    secondaryCategories: ["WORKFORCE_DEVELOPMENT"],
    countiesServed: ALL,
    address: "230 Peachtree St NE, Suite 2600, Atlanta, GA 30303",
    phone: "404-659-1150",
    website: "https://ulgatl.org",
    eligibilitySummary:
      "Workforce training, job placement, and financial coaching for adults and young adults across Metro Atlanta.",
    applicationMethod: "Register online for programs and weekly orientations. Office visits are by appointment.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
  },

  // ---------------------------------------------------- Childcare & family
  {
    id: "ga-caps",
    name: "Georgia CAPS Childcare Subsidy (DECAL)",
    category: "CHILDCARE_FAMILY",
    countiesServed: ALL,
    phone: "833-442-2277",
    website: "https://caps.decal.ga.gov/en/",
    eligibilitySummary:
      "Helps families with low incomes pay for childcare. Families must be in a priority group (which includes families without stable housing), and most parents need 24+ hours a week of work or school.",
    applicationMethod: "Apply online through the CAPS portal or Georgia Gateway.",
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
    address: "1030 Fayetteville Rd, Atlanta, GA 30316",
    phone: "404-486-9034",
    website: "https://chris180.org",
    eligibilitySummary:
      "Counseling for children, youth, and families who have experienced trauma, plus housing and a drop-in center for young people facing homelessness.",
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
    phone: "404-588-9622",
    website: "https://www.ymcaatlanta.org",
    eligibilitySummary: "Early learning, afterschool, and camp programs, with financial assistance available.",
    applicationMethod: "Contact your local branch and ask about financial assistance.",
    status: "UNKNOWN",
    lastVerified: REVIEWED,
    servesFamiliesWithChildren: true,
  },
];

export function getResourceById(id: string): Resource | undefined {
  return RESOURCES.find((r) => r.id === id);
}
