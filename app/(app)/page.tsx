import Link from "next/link";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { and, asc, gte, lt } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { payments } from "@/lib/db/schema";
import { RevenueChart } from "@/components/revenue-chart";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
  const upcoming = await db.select().from(classes).where(and(gte(classes.startsAt, today), lt(classes.startsAt, nextWeek))).orderBy(asc(classes.startsAt)).limit(3);
  const recentPayments = await db.select({ period: payments.period, amount: payments.paidAmountCents }).from(payments).orderBy(asc(payments.period));
  const chartData = Array.from({ length: 6 }, (_, index) => { const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1); const period = date.toISOString().slice(0, 10); return { label: format(date, "MMM", { locale: es }), amount: recentPayments.filter((payment) => payment.period === period).reduce((total, payment) => total + payment.amount, 0) / 100 }; });
  const currentRevenue = chartData.at(-1)?.amount ?? 0;
  return <main className="mx-auto min-h-screen max-w-2xl px-5 pb-28 pt-8"><header className="mb-8 flex items-start justify-between"><div><p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Padel Ledger</p><h1 className="text-3xl font-black tracking-tight">Buenos días</h1><p className="mt-1 text-sm text-slate-500">Tu resumen de {format(now, "MMMM")}</p></div><Link href="/classes/new" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/15" aria-label="Nueva clase"><Plus size={24} /></Link></header><section className="rounded-3xl bg-emerald-900 p-6 text-white shadow-xl shadow-emerald-950/10"><p className="text-sm text-emerald-100">Cobrado este mes</p><p className="mt-5 text-4xl font-black tracking-tight">{currentRevenue.toFixed(2)} €</p><div className="mt-6"><RevenueChart data={chartData} /></div></section><section className="mt-5 grid grid-cols-2 gap-3"><Metric label="Próximas clases" value={String(upcoming.length)} detail="en 7 días" /><Metric label="Estado" value="Activo" detail="todo listo" /></section><section className="mt-8"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Próximas clases</h2><Link href="/calendar" className="flex items-center gap-1 text-sm font-bold text-emerald-700">Ver todas <ChevronRight size={16} /></Link></div>{upcoming.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center"><CalendarDays className="mx-auto mb-3 text-slate-400" size={28} /><p className="font-bold">Todavía no hay clases</p><Link href="/classes/new" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white">Crear clase</Link></div> : <div className="space-y-3">{upcoming.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="font-black">{format(item.startsAt, "EEE d · HH:mm")}</p><p className="mt-1 text-sm text-slate-500">{item.type === "individual" ? "Individual" : item.type === "pair" ? "Pareja" : "Grupo"}</p></div>)}</div>}</section></main>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-3 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>; }
