"use client";

import { FlaskConical, RotateCcw, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DemoControlsProps {
  onLandlordRejected: () => void;
  onAssistanceUnavailable: () => void;
  onFullTransition: () => void;
  onResetMaria: () => void;
  onClear: () => void;
}

export function DemoControls({ onLandlordRejected, onAssistanceUnavailable, onFullTransition, onResetMaria, onClear }: DemoControlsProps) {
  return (
    <section className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-5" aria-labelledby="demo-controls">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-amber-700" aria-hidden />
        <h2 id="demo-controls" className="text-sm font-bold uppercase tracking-wide text-amber-900">
          Demo controls
        </h2>
      </div>
      <p className="mt-1 text-sm text-amber-900/80">For demonstrations only — simulates case events so you can see the plan adapt.</p>
      <div className="mt-4 grid gap-2">
        <Button variant="outline" size="sm" onClick={onLandlordRejected} className="justify-start border-amber-300">
          Simulate: Landlord rejected payment plan
        </Button>
        <Button variant="outline" size="sm" onClick={onAssistanceUnavailable} className="justify-start border-amber-300">
          Simulate: Rental assistance unavailable
        </Button>
        <Button variant="recovery" size="sm" onClick={onFullTransition} className="justify-start">
          <Wand2 className="h-4 w-4" aria-hidden /> Run both → see recovery transition
        </Button>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={onResetMaria}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset Maria
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear} className="text-ink-soft">
            <Trash2 className="h-4 w-4" aria-hidden /> Clear case
          </Button>
        </div>
      </div>
    </section>
  );
}
