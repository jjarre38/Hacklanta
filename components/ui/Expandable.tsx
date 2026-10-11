"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

/** Content only collapses if it's at least this much taller than the limit — no point hiding a few lines. */
const SLACK = 120;

// useLayoutEffect measures before paint (no flash of uncollapsed content) but warns during server render.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface ExpandableProps {
  children: ReactNode;
  /** Height (px) shown while collapsed. Content shorter than this plus a little slack is never collapsed. */
  collapsedHeight?: number;
  /** Background the fade blends into; match the surface the content sits on. */
  fadeClassName?: string;
  /** What's hidden, for the button text, e.g. "steps" → "Show all steps". */
  noun?: string;
  className?: string;
}

/**
 * Collapses long content to a fixed height with a fade and a "Show more" toggle.
 * Short content renders untouched. Tabbing into the hidden part expands it, so
 * keyboard users never land on an invisible control.
 */
export function Expandable({ children, collapsedHeight = 480, fadeClassName = "from-white", noun, className }: ExpandableProps) {
  const { tr, text } = useI18n();
  const container = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Re-measure whenever the content resizes (items added, details opened, viewport change).
  useIsoLayoutEffect(() => {
    const el = content.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > collapsedHeight + SLACK);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  const collapsed = overflows && !expanded;

  function onFocus(e: FocusEvent<HTMLDivElement>) {
    if (!collapsed || !container.current) return;
    const top = e.target.getBoundingClientRect().top - container.current.getBoundingClientRect().top;
    if (top > collapsedHeight - 40) setExpanded(true);
  }

  function collapse() {
    setExpanded(false);
    // If the top of the section is now off-screen, bring it back so the user isn't left mid-page.
    requestAnimationFrame(() => {
      const el = container.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  return (
    <div ref={container} className={clsx("scroll-mt-24", className)}>
      <div
        className="relative"
        style={collapsed ? { maxHeight: collapsedHeight, overflow: "hidden" } : undefined}
        onFocus={onFocus}
      >
        <div ref={content}>{children}</div>
        {collapsed && (
          <div className={clsx("pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent", fadeClassName)} aria-hidden />
        )}
      </div>
      {overflows && (
        <button
          type="button"
          onClick={() => (expanded ? collapse() : setExpanded(true))}
          aria-expanded={expanded}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          {expanded ? tr("Show less") : noun ? tr("Show all {0}", { 0: text(noun) }) : tr("Show more")}
          <ChevronDown className={clsx("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>
      )}
    </div>
  );
}
