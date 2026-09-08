import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, eyebrow, backHref, action, className }: { title: string; eyebrow?: string; backHref?: string; action?: React.ReactNode; className?: string }) {
  return <header className={cn("flex items-start gap-3", className)}>{backHref && <Link href={backHref} aria-label="Volver" className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200"><ArrowLeft size={21} /></Link>}<div className="min-w-0 flex-1">{eyebrow && <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>}<h1 className="mt-1 text-3xl font-black tracking-tight">{title}</h1></div>{action}</header>;
}
