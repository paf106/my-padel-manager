import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeletons/page-skeletons";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function EditStudentLoading() {
  return (
    <SkeletonScreen label="Cargando edición del alumno" width="form">
      <PageHeaderSkeleton back />
      <div className="mt-8">
        <FormSkeleton fields={5} />
      </div>
    </SkeletonScreen>
  );
}
