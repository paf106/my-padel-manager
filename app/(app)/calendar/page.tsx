import Link from "next/link";
import { and, asc, gte, lt } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { Fab } from "@/components/ui/fab";
import { PageHeader } from "@/components/ui/page-header";
import { madridMonthRange } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const now = new Date();
  const { start, end } = madridMonthRange(now);
  const rows = await db.select().from(classes).where(and(gte(classes.startsAt, start), lt(classes.startsAt, end))).orderBy(asc(classes.startsAt));
  return (
    <main className="mx-auto min-h-screen max-w-5xl">
      <PageHeader title={format(now, "MMMM yyyy", { locale: es })} eyebrow="Agenda" action={<div className="flex gap-2"><Link href="/classes/series/new" className="rounded-xl border border-emerald-800 px-3 py-3 text-sm font-bold text-emerald-800">Serie</Link><Link href="/classes/new" className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Añadir clase</Link></div>} />
      <Fab href="/classes/new" label="Nueva clase" icon={Plus} />
      {rows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center"><CalendarDays className="mx-auto mb-3 text-slate-400" /><p className="font-bold">No hay clases este mes</p><p className="mt-1 text-sm text-slate-500">Añade una clase para verla aquí.</p></div> : <div className="mt-8 space-y-3">{rows.map((item) => <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:gap-8 lg:px-6"><div className="w-14 text-center"><p className="text-xs font-bold uppercase text-slate-500">{format(item.startsAt, "EEE", { locale: es })}</p><p className="text-2xl font-black">{format(item.startsAt, "d")}</p></div><div className="border-l border-slate-200 pl-4"><Link href={`/classes/${item.id}`} className="font-black">{format(item.startsAt, "HH:mm")} · {item.type === "individual" ? "Individual" : item.type === "pair" ? "Pareja" : "Grupo"}</Link><p className="mt-1 text-sm text-slate-500">{item.status === "completed" ? "Terminada" : item.status === "cancelled" ? "Cancelada" : "Pendiente"}</p></div></article>)}</div>}
    </main>
  );
}
