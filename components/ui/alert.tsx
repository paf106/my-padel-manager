import { cn } from "@/lib/utils";

export function Alert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "warning" | "info" }) { return <p role="alert" className={cn("rounded-xl px-4 py-3 text-sm font-bold", tone === "error" && "bg-red-50 text-red-800", tone === "warning" && "bg-amber-50 text-amber-800", tone === "info" && "bg-sky-50 text-sky-800")}>{children}</p>; }
