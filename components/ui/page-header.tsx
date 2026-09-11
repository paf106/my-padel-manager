import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  eyebrow,
  subtitle,
  backHref,
  action,
  className,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-start gap-3", className)}>
      {backHref && (
        <Link
          href={backHref}
          aria-label="Volver"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft size={21} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
