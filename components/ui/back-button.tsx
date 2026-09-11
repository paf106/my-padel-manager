"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({ fallback, label }: { fallback: string; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
    >
      <ArrowLeft size={19} />
      <span>{label}</span>
    </button>
  );
}
