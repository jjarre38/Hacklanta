"use client";

import type { Resource, UserCase } from "@/types";
import { calculateFinancialGap } from "@/lib/engine/resourceCombinationEngine";
import { ResourceCombinationPanel } from "@/components/resources/ResourceCombinationPanel";

export function FinancialSummary({ userCase, resources }: { userCase: UserCase; resources: Resource[] }) {
  const gap = calculateFinancialGap(userCase, resources);
  return <ResourceCombinationPanel gap={gap} />;
}
