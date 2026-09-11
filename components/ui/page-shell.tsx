import { cn } from "@/lib/utils";

export function PageShell({
  children,
  width = "list",
  className,
}: {
  children: React.ReactNode;
  width?: "form" | "list" | "wide";
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto min-h-screen pb-12",
        width === "form" && "max-w-3xl",
        width === "list" && "max-w-5xl",
        width === "wide" && "max-w-7xl",
        className,
      )}
    >
      {children}
    </main>
  );
}
