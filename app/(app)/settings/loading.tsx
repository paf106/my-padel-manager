import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeletons/page-skeletons";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <SkeletonScreen label="Cargando ajustes" width="form">
      <PageHeaderSkeleton />
      <div className="mt-3" aria-hidden="true">
        <div className="skeleton h-4 w-full max-w-xl rounded-lg" />
        <div className="skeleton mt-2 h-4 w-72 rounded-lg" />
      </div>
      <div className="mt-8">
        <FormSkeleton fields={5} />
      </div>
    </SkeletonScreen>
  );
}
