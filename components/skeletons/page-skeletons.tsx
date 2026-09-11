import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export function PageHeaderSkeleton({
  action = "none",
  back = false,
  subtitle = false,
}: {
  action?: "none" | "icon" | "button";
  back?: boolean;
  subtitle?: boolean;
}) {
  return (
    <header className="flex items-start gap-3">
      {back && <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />}
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-1 h-9 w-48 rounded-xl" />
        {subtitle && <Skeleton className="mt-2 h-4 w-64" />}
      </div>
      {action === "icon" && <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />}
      {action === "button" && <Skeleton className="h-11 w-32 shrink-0 rounded-xl" />}
    </header>
  );
}

export function MobileCardsSkeleton({
  count = 6,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-3 w-32" />
              <Skeleton className="mt-2 h-3 w-28" />
              <Skeleton className="mt-2 h-3 w-36" />
            </div>
            <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaymentCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4 flex justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="mt-4 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ columns = 5, rows = 6 }: { columns?: 5 | 7; rows?: number }) {
  const gridClass = columns === 7 ? "grid-cols-7 lg:grid-cols-7" : "grid-cols-5 lg:grid-cols-5";
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      aria-hidden="true"
    >
      <div className={`grid gap-4 bg-slate-50 px-5 py-4 ${gridClass}`}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} className="h-3 w-16" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className={`grid gap-4 px-5 py-5 ${gridClass}`}>
            {Array.from({ length: columns }, (_, column) => (
              <Skeleton key={column} className={`h-3 ${column === 0 ? "w-32" : "w-20"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div
      className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2"
      aria-hidden="true"
    >
      {Array.from({ length: fields }, (_, index) => (
        <div key={index}>
          <Skeleton className="h-3 w-36" />
          <Skeleton className="mt-3 h-12 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-xl lg:col-span-2 lg:w-36" />
    </div>
  );
}

export function DetailSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-11 w-36 rounded-xl" />
      <Skeleton className="mt-7 h-9 w-64 rounded-xl" />
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5">
        {Array.from({ length: items }, (_, index) => (
          <div
            key={index}
            className="flex justify-between gap-4 border-b border-slate-100 py-5 last:border-0"
          >
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-6 w-48 rounded-lg" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
          >
            <SkeletonText lines={2} className="w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
