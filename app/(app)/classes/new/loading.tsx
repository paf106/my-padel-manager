import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeletons/page-skeletons";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function NewClassLoading() {
  return (
    <SkeletonScreen label="Cargando formulario de nueva clase" width="form">
      <PageHeaderSkeleton back />
      <div className="mt-8">
        <FormSkeleton fields={7} />
      </div>
    </SkeletonScreen>
  );
}
