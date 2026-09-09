"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CircleDollarSign, CreditCard, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/calendar") return pathname.startsWith("/calendar") || pathname.startsWith("/classes");
  return pathname.startsWith(href);
}

const icons = { home: CircleDollarSign, calendar: CalendarDays, students: Users, payments: CreditCard, settings: Settings } as const;

export function NavLink({ href, label, icon, variant }: { href: string; label: string; icon: keyof typeof icons; variant: "sidebar" | "bottom" }) {
  const active = isActive(usePathname(), href);
  const Icon = icons[icon];
  if (variant === "bottom") {
    return <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 flex-1 flex-col items-center gap-1 text-xs font-bold", active ? "text-emerald-800" : "text-slate-500")}><span className={cn("flex h-7 w-10 items-center justify-center rounded-lg", active && "bg-emerald-800 text-white")}><Icon size={21} /></span><span>{label}</span></Link>;
  }
  return <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors", active ? "bg-emerald-800 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-emerald-800")}><Icon size={20} /><span>{label}</span></Link>;
}
