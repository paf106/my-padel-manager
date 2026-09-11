import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";
import {
  PageHeaderSkeleton,
  PaymentCardsSkeleton,
  TableSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function PaymentsLoading() {
  return (
    <SkeletonScreen label="Cargando pagos" width="list">
      <PageHeaderSkeleton />
      <section className="mt-6 rounded-2xl bg-emerald-900 p-5" aria-hidden="true">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton tone="dark" className="h-4 w-32" />
            <Skeleton tone="dark" className="mt-3 h-6 w-24 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <Skeleton tone="dark" className="h-10 w-28 rounded-xl" />
            <Skeleton tone="dark" className="h-11 w-32 rounded-xl" />
          </div>
        </div>
      </section>
      <div className="mt-6 lg:hidden">
        <PaymentCardsSkeleton />
      </div>
      <div className="mt-6 hidden lg:block">
        <TableSkeleton columns={7} />
      </div>
    </SkeletonScreen>
  );
}
