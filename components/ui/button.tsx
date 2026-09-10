import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md"; className?: string } = {}) {
  return cn("inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-bold transition-colors", size === "sm" && "min-h-11", variant === "primary" && "bg-primary text-white hover:bg-primary-hover", variant === "secondary" && "border border-primary text-primary hover:bg-primary-soft", variant === "danger" && "bg-danger text-white hover:bg-red-800", variant === "ghost" && "text-slate-600 hover:bg-slate-100", className);
}

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return <button className={buttonClasses({ variant, className })} {...props} />;
}
