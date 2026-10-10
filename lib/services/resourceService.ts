import type { Resource } from "@/types";
import { RESOURCES } from "@/lib/data/resources";
import { getSupabaseServerClient } from "@/lib/supabase";

// Loads resources from Supabase when configured, otherwise from the static
// dataset. Matching/scoring lives in lib/engine/resourceMatcher.ts.

interface ResourceRow {
  id: string;
  name: string;
  category: Resource["category"];
  secondary_categories: Resource["category"][] | null;
  counties_served: string[];
  zip_codes_served: string[] | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  eligibility_summary: string;
  application_method: string;
  status: Resource["status"];
  last_verified: string;
  typical_amount: number | null;
  serves_families_with_children: boolean | null;
  requires_eviction_filing: boolean | null;
}

function fromRow(r: ResourceRow): Resource {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    secondaryCategories: r.secondary_categories ?? [],
    countiesServed: r.counties_served,
    zipCodesServed: r.zip_codes_served ?? undefined,
    address: r.address ?? undefined,
    phone: r.phone ?? undefined,
    website: r.website ?? undefined,
    eligibilitySummary: r.eligibility_summary,
    applicationMethod: r.application_method,
    status: r.status,
    lastVerified: r.last_verified,
    typicalAmount: r.typical_amount == null ? undefined : Number(r.typical_amount),
    servesFamiliesWithChildren: r.serves_families_with_children ?? false,
    requiresEvictionFiling: r.requires_eviction_filing ?? false,
  };
}

/** Server-side: all resources, preferring Supabase and falling back to static data. */
export async function getAllResources(): Promise<{ resources: Resource[]; source: "supabase" | "static" }> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from("resources").select("*");
    if (!error && data && data.length > 0) {
      return { resources: (data as ResourceRow[]).map(fromRow), source: "supabase" };
    }
    if (error) console.warn("[resources] Supabase query failed, using static data:", error.message);
  }
  return { resources: RESOURCES, source: "static" };
}
