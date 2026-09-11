import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <SkeletonScreen label="Cargando página">
      <header className="flex items-start justify-between">
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-48 rounded-xl" />
          <Skeleton className="mt-3 h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl lg:hidden" />
      </header>
      <div className="mt-8 grid gap-5 lg:grid-cols-12" aria-hidden="true">
        <section className="rounded-3xl bg-emerald-900 p-6 lg:col-span-8">
          <Skeleton tone="dark" className="h-4 w-32" />
          <Skeleton tone="dark" className="mt-5 h-11 w-40 rounded-xl" />
          <div className="mt-6 h-48 w-full" />
        </section>
        <section className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
          <MetricSkeleton />
          <MetricSkeleton />
        </section>
      </div>
      <section className="mt-8" aria-hidden="true">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded-lg" />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-3 h-3 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}

function MetricSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4" aria-hidden="true">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-8 w-20 rounded-lg" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}
