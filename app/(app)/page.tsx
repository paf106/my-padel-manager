import Link from "next/link";
import { and, asc, gte, lt } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { classes, payments } from "@/lib/db/schema";
import { RevenueChart } from "@/components/revenue-chart";
import { Fab } from "@/components/ui/fab";
import { formatMoney } from "@/lib/format";
import { madridMonthKey, madridMonthRange, madridNextMonthStartKey, madridRecentMonthStartKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const { start: monthStart } = madridMonthRange(now);
  const today = monthStart;
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const period = `${madridMonthKey(now)}-01`;
  const [upcoming, currentPayments, recentPayments] = await Promise.all([
    db.select().from(classes).where(and(gte(classes.startsAt, today), lt(classes.startsAt, nextWeek))).orderBy(asc(classes.startsAt)).limit(3),
    db.select({ period: payments.period, paid: payments.paidAmountCents, computed: payments.computedAmountCents, override: payments.overrideAmountCents }).from(payments).where(and(gte(payments.period, period), lt(payments.period, madridNextMonthStartKey(now)))),
    db.select({ period: payments.period, paid: payments.paidAmountCents }).from(payments).where(gte(payments.period, madridRecentMonthStartKey(now))),
  ]);
  const chartData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const month = date.toISOString().slice(0, 7);
    return { label: format(date, "MMM", { locale: es }), amount: recentPayments.filter((payment) => payment.paid > 0 && payment.period.slice(0, 7) === month).reduce((total, payment) => total + payment.paid, 0) / 100 };
  });
  const currentPaid = currentPayments.reduce((total, payment) => total + payment.paid, 0);
  const currentDue = currentPayments.reduce((total, payment) => total + (payment.override ?? payment.computed), 0);
  const outstanding = Math.max(0, currentDue - currentPaid);
  return <main className="mx-auto min-h-screen max-w-7xl"><header className="mb-8 flex items-start justify-between"><div><p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Padel Ledger</p><h1 className="text-3xl font-black tracking-tight">Buenos días</h1><p className="mt-1 text-sm text-slate-500">Tu resumen de {format(now, "MMMM", { locale: es })}</p></div></header><Fab href="/classes/new" label="Nueva clase" icon={Plus} /><div className="grid gap-5 lg:grid-cols-12"><section className="rounded-3xl bg-emerald-900 p-6 text-white shadow-xl shadow-emerald-950/10 lg:col-span-8"><p className="text-sm text-emerald-100">Cobrado este mes</p><p className="mt-5 text-4xl font-black tracking-tight">{formatMoney(currentPaid)}</p><div className="mt-6"><RevenueChart data={chartData} /></div></section><section className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1"><Metric label="Próximas clases" value={String(upcoming.length)} detail="en 7 días" /><Metric label="Pendiente de cobro" value={formatMoney(outstanding)} detail="este mes" /></section></div><section className="mt-8"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Próximas clases</h2><Link href="/calendar" className="flex items-center gap-1 text-sm font-bold text-emerald-700">Ver todas <ChevronRight size={16} /></Link></div>{upcoming.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center"><CalendarDays className="mx-auto mb-3 text-slate-400" size={28} /><p className="font-bold">Todavía no hay clases</p></div> : <div className="grid gap-3 lg:grid-cols-3">{upcoming.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="font-black">{format(item.startsAt, "EEE d · HH:mm", { locale: es })}</p><p className="mt-1 text-sm text-slate-500">{item.type === "individual" ? "Individual" : item.type === "pair" ? "Pareja" : "Grupo"}</p></div>)}</div>}</section></main>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-3 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>; }
