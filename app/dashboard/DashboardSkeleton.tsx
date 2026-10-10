export function DashboardSkeleton() {
  return (
    <div className="container-page animate-pulse py-8 sm:py-10" aria-busy="true" aria-label="Loading your plan">
      <div className="h-8 w-64 rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-200" />
      <div className="mt-6 h-48 rounded-2xl bg-slate-200" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          <div className="h-96 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
