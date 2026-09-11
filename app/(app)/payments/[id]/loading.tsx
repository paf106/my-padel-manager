import { FormSkeleton } from "@/components/skeletons/page-skeletons";
import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function PaymentDetailLoading() {
  return (
    <SkeletonScreen label="Cargando detalle del pago" width="detail">
      <Skeleton className="h-11 w-36 rounded-xl" />
      <Skeleton className="mt-7 h-9 w-64 rounded-xl" />
      <Skeleton className="mt-3 h-4 w-48" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2" aria-hidden="true">
        <FormSkeleton fields={4} />
        <section>
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
              >
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </SkeletonScreen>
  );
}
