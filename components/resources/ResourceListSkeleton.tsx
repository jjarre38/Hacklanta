"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

export function ResourceListSkeleton() {
  const { tr } = useI18n();
  return (
    <div className="container-page animate-pulse py-8 sm:py-10" aria-busy="true" aria-label={tr("Loading resources")}>
      <div className="h-8 w-72 rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
      <div className="mt-6 h-20 rounded-2xl bg-slate-200" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
