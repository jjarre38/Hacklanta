"use client";

import { useCase } from "@/lib/client/caseStore";
import { effectiveStage } from "@/lib/engine/caseClassifier";
import { RIGHTS_CONTENT } from "@/lib/data/rightsContent";
import { RightsCard } from "@/components/rights/RightsCard";

export function RightsList() {
  const { userCase } = useCase();
  const stage = userCase ? effectiveStage(userCase) : null;

  // Cards that match the user's stage come first and are highlighted.
  const cards = [...RIGHTS_CONTENT].sort((a, b) => {
    if (!stage) return 0;
    return Number(b.stages.includes(stage)) - Number(a.stages.includes(stage));
  });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {cards.map((card) => (
        <RightsCard key={card.id} card={card} highlighted={Boolean(stage && card.stages.includes(stage) && card.id !== "lockout")} />
      ))}
    </div>
  );
}
