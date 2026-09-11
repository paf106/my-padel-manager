"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectPill({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="h-11 w-full appearance-none rounded-full border border-slate-200 bg-white pl-14 pr-10 text-sm font-bold text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 lg:h-10"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
