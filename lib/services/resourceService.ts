import type { Resource } from "@/types";
import { RESOURCES } from "@/lib/data/resources";

/** Reviewed, offline-capable catalog. Unreviewed database rows are not public recommendations. */
export async function getAllResources(): Promise<{ resources: Resource[]; source: "supabase" | "static" }> {
  return { resources: RESOURCES, source: "static" };
}
