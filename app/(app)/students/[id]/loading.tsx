import { DetailSkeleton } from "@/components/skeletons/page-skeletons";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function StudentDetailLoading() {
  return (
    <SkeletonScreen label="Cargando ficha del alumno" width="list">
      <DetailSkeleton />
    </SkeletonScreen>
  );
}
