"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FlaskConical, RotateCcw, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DemoControlsProps {
  onLandlordRejected: () => void;
  onAssistanceUnavailable: () => void;
  onFullTransition: () => void;
  onResetMaria: () => void;
  onClear: () => void;
}

export function DemoControls({ onLandlordRejected, onAssistanceUnavailable, onFullTransition, onResetMaria, onClear }: DemoControlsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** Run a demo action and close the menu. */
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="demo-controls-panel"
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-900 hover:bg-amber-100"
      >
        <FlaskConical className="h-4 w-4 text-amber-700" aria-hidden />
        Demo
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <section
          id="demo-controls-panel"
          aria-labelledby="demo-controls"
          className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 shadow-lg"
        >
          <h2 id="demo-controls" className="text-sm font-bold uppercase tracking-wide text-amber-900">
            Demo controls
          </h2>
          <p className="mt-1 text-sm text-amber-900/80">For demonstrations only — simulates case events so you can see the plan adapt.</p>
          <div className="mt-4 grid gap-2">
            <Button variant="outline" size="sm" onClick={run(onLandlordRejected)} className="justify-start border-amber-300">
              Simulate: Landlord rejected payment plan
            </Button>
            <Button variant="outline" size="sm" onClick={run(onAssistanceUnavailable)} className="justify-start border-amber-300">
              Simulate: Rental assistance unavailable
            </Button>
            <Button variant="recovery" size="sm" onClick={run(onFullTransition)} className="justify-start">
              <Wand2 className="h-4 w-4" aria-hidden /> Run both → see recovery transition
            </Button>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" onClick={run(onResetMaria)}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Reset Maria
              </Button>
              <Button variant="ghost" size="sm" onClick={run(onClear)} className="text-ink-soft">
                <Trash2 className="h-4 w-4" aria-hidden /> Clear case
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
