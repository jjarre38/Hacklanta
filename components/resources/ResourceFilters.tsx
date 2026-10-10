"use client";

import type { ResourceCategory } from "@/types";
import { CATEGORY_LABELS } from "@/lib/engine/resourceMatcher";
import { SERVICE_COUNTIES } from "@/lib/data/serviceArea";

export interface ResourceFilterState {
  category: ResourceCategory | "";
  county: string;
  openOnly: boolean;
}

interface ResourceFiltersProps {
  value: ResourceFilterState;
  onChange: (v: ResourceFilterState) => void;
  /** Restrict the category dropdown (e.g. housing or employment pages). */
  categories?: ResourceCategory[];
}

export function ResourceFilters({ value, onChange, categories }: ResourceFiltersProps) {
  const options = categories ?? (Object.keys(CATEGORY_LABELS) as ResourceCategory[]);
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor="filter-category" className="field-label">
          Type of help
        </label>
        <select
          id="filter-category"
          className="field-input"
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value as ResourceCategory | "" })}
        >
          <option value="">All types</option>
          {options.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-county" className="field-label">
          County
        </label>
        <select id="filter-county" className="field-input" value={value.county} onChange={(e) => onChange({ ...value, county: e.target.value })}>
          <option value="">All Metro Atlanta counties</option>
          {SERVICE_COUNTIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} County
            </option>
          ))}
        </select>
      </div>
      <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-2.5">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          checked={value.openOnly}
          onChange={(e) => onChange({ ...value, openOnly: e.target.checked })}
        />
        <span className="text-sm font-medium">Open now only</span>
      </label>
    </div>
  );
}
