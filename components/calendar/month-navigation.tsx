import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildCalendarHref } from "@/lib/calendar";
import { madridMonthKey } from "@/lib/dates";

export function MonthNavigation({ year, month }: { year: number; month: number }) {
  const previous = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const current = buildCalendarHref("/calendar", ...getCurrentMonth());
  return <div className="inline-flex items-center gap-2"><Link aria-label="Mes anterior" href={buildCalendarHref("/calendar", previous.year, previous.month)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 hover:bg-slate-100"><ChevronLeft size={18} /></Link><Link href={current} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-100">Mes actual</Link><Link aria-label="Mes siguiente" href={buildCalendarHref("/calendar", next.year, next.month)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 hover:bg-slate-100"><ChevronRight size={18} /></Link></div>;
}

function getCurrentMonth() { const [year, month] = madridMonthKey().split("-").map(Number); return [year, month] as const; }
