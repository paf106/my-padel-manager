import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function ClassDetailLoading() {
  return (
    <SkeletonScreen label="Cargando detalle de la clase" width="list">
      <div className="flex items-start justify-between gap-3" aria-hidden="true">
        <Skeleton className="h-11 w-24 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>
      <Skeleton className="mt-7 h-9 w-48 rounded-xl" />
      <div className="mt-3 flex gap-3" aria-hidden="true">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2" aria-hidden="true">
        <ClassCardSkeleton />
        <ClassCardSkeleton />
      </div>
    </SkeletonScreen>
  );
}

function ClassCardSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </section>
  );
}
