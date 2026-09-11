import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeletons/page-skeletons";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function EditClassLoading() {
  return (
    <SkeletonScreen label="Cargando edición de la clase" width="form">
      <PageHeaderSkeleton back />
      <div className="mt-8">
        <FormSkeleton fields={7} />
      </div>
    </SkeletonScreen>
  );
}
