import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeletons/page-skeletons";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function NewClassSeriesLoading() {
  return (
    <SkeletonScreen label="Cargando formulario de nueva serie" width="form">
      <PageHeaderSkeleton back />
      <div className="mt-8">
        <FormSkeleton fields={8} />
      </div>
    </SkeletonScreen>
  );
}
