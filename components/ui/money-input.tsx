import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function MoneyInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative mt-2">
      <input type="number" min="0" step="0.01" inputMode="decimal" className={cn("h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 pr-10 transition focus:border-primary focus:ring-2 focus:ring-primary/20", className)} {...props} />
      <span className="pointer-events-none absolute right-3 top-3 text-slate-400">€</span>
    </div>
  );
}
