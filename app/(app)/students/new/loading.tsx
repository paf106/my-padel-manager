import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeletons/page-skeletons";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function NewStudentLoading() {
  return (
    <SkeletonScreen label="Cargando formulario de nuevo alumno" width="form">
      <PageHeaderSkeleton back />
      <div className="mt-8">
        <FormSkeleton fields={6} />
      </div>
    </SkeletonScreen>
  );
}
