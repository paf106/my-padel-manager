import { cn } from "@/lib/utils";

type SkeletonTone = "light" | "dark";

export function Skeleton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: SkeletonTone;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton rounded-lg", tone === "dark" && "skeleton--dark", className)}
    />
  );
}

export function SkeletonText({
  lines = 2,
  className,
  tone = "light",
}: {
  lines?: number;
  className?: string;
  tone?: SkeletonTone;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} tone={tone} className={cn("h-3", index === lines - 1 && "w-3/5")} />
      ))}
    </div>
  );
}

export function SkeletonScreen({
  label,
  children,
  width = "wide",
}: {
  label: string;
  children: React.ReactNode;
  width?: "form" | "detail" | "list" | "wide";
}) {
  return (
    <main
      aria-busy="true"
      aria-label={label}
      role="status"
      className={cn(
        "mx-auto min-h-screen pb-12",
        width === "form" && "max-w-3xl",
        width === "detail" && "max-w-4xl",
        width === "list" && "max-w-5xl",
        width === "wide" && "max-w-7xl",
      )}
    >
      <span className="sr-only">{label}</span>
      {children}
    </main>
  );
}
