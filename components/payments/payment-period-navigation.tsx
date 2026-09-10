import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaymentPeriodNavigation({ period }: { period: string }) {
  const [year, month] = period.split("-").map(Number);
  const previous = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const format = (value: { year: number; month: number }) => `${value.year}-${String(value.month).padStart(2, "0")}`;
  return <div className="inline-flex items-center gap-2"><Link aria-label="Periodo anterior" href={`/payments?period=${format(previous)}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 hover:bg-white/10"><ChevronLeft size={18} /></Link><Link href="/payments" className="rounded-xl border border-white/30 px-3 py-2 text-sm font-bold hover:bg-white/10">Mes actual</Link><Link aria-label="Periodo siguiente" href={`/payments?period=${format(next)}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 hover:bg-white/10"><ChevronRight size={18} /></Link></div>;
}
