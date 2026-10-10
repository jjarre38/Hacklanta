export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-screen-2xl animate-pulse px-4 py-10 sm:px-8 sm:py-12 lg:px-12" aria-busy="true" aria-label="Loading your plan">
      <div className="h-8 w-64 rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-200" />
      <div className="mt-6 h-48 rounded-2xl bg-slate-200" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-12">
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
