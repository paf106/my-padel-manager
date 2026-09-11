import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/page-skeletons";

export default function CalendarLoading() {
  return (
    <SkeletonScreen label="Cargando calendario" width="list">
      <div className="hidden lg:block" aria-hidden="true">
        <PageHeaderSkeleton />
        <div className="mt-6 flex justify-end">
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={index} className="h-4 rounded-lg" />
            ))}
            {Array.from({ length: 35 }, (_, index) => (
              <div key={index} className="min-h-28 rounded-xl border border-slate-200 p-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="mt-3 h-3 w-16" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:hidden" aria-hidden="true">
        <PageHeaderSkeleton />
        <Skeleton className="mx-auto mt-6 h-10 w-44 rounded-xl" />
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-6 w-40 rounded-lg" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="mt-3 h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
