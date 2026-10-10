import { NextResponse } from "next/server";
import type { CaseStatus, ResourceCategory } from "@/types";
import { getAllResources } from "@/lib/services/resourceService";
import { CATEGORY_LABELS, matchResources } from "@/lib/engine/resourceMatcher";

const STATUSES: CaseStatus[] = ["PREVENTION", "URGENT_INTERVENTION", "LEGAL_HELP_RECOMMENDED", "TRANSITION_RECOVERY"];

/**
 * GET /api/resources?county=Fulton&category=RENTAL_ASSISTANCE&stage=URGENT_INTERVENTION&openOnly=1
 * Returns all resources plus scored matches for the given filters.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const county = searchParams.get("county") || undefined;
  const categories = searchParams
    .getAll("category")
    .filter((c): c is ResourceCategory => c in CATEGORY_LABELS);
  const stageParam = searchParams.get("stage");
  const stage = STATUSES.find((s) => s === stageParam);
  const openOnly = searchParams.get("openOnly") === "1";

  const { resources, source } = await getAllResources();
  const matches = matchResources(resources, null, {
    county,
    categories: categories.length ? categories : undefined,
    statusOverride: stage,
    openOnly,
  });

  return NextResponse.json({ source, resources, matches });
}
