import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";
import {
  MobileCardsSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function StudentsLoading() {
  return (
    <SkeletonScreen label="Cargando alumnos" width="list">
      <PageHeaderSkeleton action="button" />
      <Skeleton className="mt-6 h-12 w-full max-w-2xl rounded-xl" />
      <div className="mt-8 lg:hidden">
        <MobileCardsSkeleton />
      </div>
      <div className="mt-8 hidden lg:block">
        <TableSkeleton columns={5} />
      </div>
    </SkeletonScreen>
  );
}
