import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) { return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", tone === "success" && "bg-emerald-100 text-emerald-800", tone === "warning" && "bg-amber-100 text-amber-800", tone === "danger" && "bg-red-100 text-red-800", tone === "neutral" && "bg-slate-100 text-slate-600")}>{children}</span>; }
