import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return <button className={cn("min-h-11 rounded-xl px-4 text-sm font-bold transition-colors", variant === "primary" && "bg-emerald-800 text-white hover:bg-emerald-700", variant === "secondary" && "border border-emerald-800 text-emerald-800 hover:bg-emerald-50", variant === "danger" && "text-red-700 hover:bg-red-50", className)} {...props} />;
}
