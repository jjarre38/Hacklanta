import { addDays, formatDate } from "@/lib/format";

// A fictional dispossessory summons used for the "Demo Document" flow.
// Names, case number, and address are invented. Dates are relative to today.

export function sampleNoticeText(now: Date = new Date()): string {
  const filed = formatDate(addDays(now, -6).toISOString(), { month: "long", day: "numeric", year: "numeric" });
  const hearing = formatDate(addDays(now, 7).toISOString(), { month: "long", day: "numeric", year: "numeric" });
  return `IN THE MAGISTRATE COURT OF FULTON COUNTY
STATE OF GEORGIA

DISPOSSESSORY WARRANT / SUMMONS                    CIVIL ACTION FILE NO. 26ED184732

PLAINTIFF (Landlord):  Westview Commons Apartments, LLC
                       c/o Property Management Office

DEFENDANT (Tenant):    Maria Alvarez and All Other Occupants
                       1180 Ralph David Abernathy Blvd SW, Apt 4B
                       Atlanta, GA 30310

Date Filed: ${filed}

AFFIDAVIT: Plaintiff states that Defendant is in possession of the premises above as a tenant and has failed to pay rent now due.
Rent owed through date of filing ........ $1,250.00
Late fees ................................ $150.00
TOTAL CLAIMED ............................ $1,400.00

SUMMONS TO DEFENDANT:
You are hereby required to answer this affidavit, in writing or orally, within SEVEN (7) DAYS of the date of service.
If you fail to answer, a writ of possession may be issued against you by default.

A hearing on this matter has been set for ${hearing} at 9:00 AM in Courtroom 1C,
Fulton County Justice Center Tower, 185 Central Ave SW, Atlanta, GA 30303.

This ____ day of __________, 20__.
Clerk / Deputy Clerk, Magistrate Court of Fulton County`;
}
