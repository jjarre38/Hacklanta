// HomePath service area. Geographic expansion is a DATA change: add a county
// (and its ZIP codes) here and add resources that list it in countiesServed.
// No component should hard-code county names.

export interface ServiceCounty {
  name: string; // e.g. "Fulton"
  state: string;
  /** ZIP codes primarily in this county. Some ZIPs cross county lines; the user can override. */
  zipCodes: string[];
  magistrateCourtUrl?: string;
}

export const SERVICE_STATE = "GA";
export const SERVICE_REGION_NAME = "Metro Atlanta";

export const SERVICE_COUNTIES: ServiceCounty[] = [
  {
    name: "Fulton",
    state: "GA",
    magistrateCourtUrl: "https://magistratefulton.org",
    zipCodes: [
      "30004", "30005", "30009", "30022", "30075", "30076", "30213", "30268", "30291",
      "30303", "30305", "30306", "30307", "30308", "30309", "30310", "30311", "30312",
      "30313", "30314", "30315", "30318", "30324", "30326", "30327", "30328", "30331",
      "30336", "30337", "30342", "30344", "30349", "30350", "30354", "30363",
    ],
  },
  {
    name: "DeKalb",
    state: "GA",
    magistrateCourtUrl: "https://www.dekalbcountyga.gov/magistrate-court",
    zipCodes: [
      "30002", "30021", "30030", "30032", "30033", "30034", "30035", "30038", "30058",
      "30079", "30083", "30084", "30087", "30088", "30316", "30317", "30319", "30329",
      "30338", "30340", "30341", "30345", "30346", "30360",
    ],
  },
  {
    name: "Cobb",
    state: "GA",
    magistrateCourtUrl: "https://www.cobbcounty.org/courts/magistrate-court",
    zipCodes: [
      "30006", "30008", "30060", "30062", "30064", "30066", "30067", "30068", "30080",
      "30082", "30101", "30102", "30106", "30111", "30126", "30144", "30152", "30339",
    ],
  },
  {
    name: "Gwinnett",
    state: "GA",
    magistrateCourtUrl: "https://www.gwinnettcourts.com/magistrate-court",
    zipCodes: [
      "30011", "30017", "30019", "30024", "30039", "30043", "30044", "30045", "30046",
      "30047", "30052", "30071", "30078", "30092", "30093", "30096", "30097", "30515",
      "30517", "30518", "30519",
    ],
  },
  {
    name: "Clayton",
    state: "GA",
    magistrateCourtUrl: "https://www.claytoncountyga.gov/government/courts/magistrate-court",
    zipCodes: ["30236", "30237", "30238", "30250", "30260", "30273", "30274", "30288", "30296", "30297"],
  },
];

export const SUPPORTED_COUNTY_NAMES = SERVICE_COUNTIES.map((c) => c.name);

export function isSupportedCounty(county: string | undefined | null): boolean {
  if (!county) return false;
  const normalized = normalizeCounty(county);
  return SUPPORTED_COUNTY_NAMES.some((c) => c.toLowerCase() === normalized.toLowerCase());
}

/** "Fulton County, GA" -> "Fulton" */
export function normalizeCounty(county: string): string {
  return county.replace(/county/i, "").replace(/,?\s*(GA|Georgia)\s*$/i, "").trim();
}

export function countyForZip(zip: string): string | null {
  const z = zip.trim().slice(0, 5);
  const match = SERVICE_COUNTIES.find((c) => c.zipCodes.includes(z));
  return match ? match.name : null;
}

export function getCounty(name: string): ServiceCounty | undefined {
  const n = normalizeCounty(name).toLowerCase();
  return SERVICE_COUNTIES.find((c) => c.name.toLowerCase() === n);
}
