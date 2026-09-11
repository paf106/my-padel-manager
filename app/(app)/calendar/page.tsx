import Link from "next/link";
import { and, asc, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { classTypeLabels, classStatusLabels } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { MonthNavigation } from "@/components/calendar/month-navigation";
import { WeekStrip } from "@/components/calendar/week-strip";
import { buildCalendarHref, getCalendarDays, getStripDays, parseCalendarMonth } from "@/lib/calendar";
import { madridDateKey, madridMonthRange, madridTime, madridToday } from "@/lib/dates";
import { capitalizeFirst } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string; day?: string }> }) {
  const params = await searchParams;
  const { year, month } = parseCalendarMonth(params.year, params.month);
  const monthDays = getCalendarDays(year, month);
  const selectedDay = params.day ?? monthDays.cells.find((cell) => cell?.isToday)?.date ?? monthDays.cells.find(Boolean)?.date ?? `${year}-${String(month).padStart(2, "0")}-01`;
  const stripDays = getStripDays(year, month);
  const rangeStart = madridMonthRange(new Date(`${stripDays[0].date}T12:00:00Z`)).start;
  const rangeEnd = madridMonthRange(new Date(`${stripDays.at(-1)!.date}T12:00:00Z`)).end;
  const rows = await db.select({ id: classes.id, type: classes.type, status: classes.status, startsAt: classes.startsAt }).from(classes).where(and(gte(classes.startsAt, rangeStart), lt(classes.startsAt, rangeEnd))).orderBy(asc(classes.startsAt));
  const byDay = new Map<string, typeof rows>();
  for (const item of rows) {
    const key = madridDateKey(item.startsAt);
    byDay.set(key, [...(byDay.get(key) ?? []), item]);
  }
  const selectedClasses = byDay.get(selectedDay) ?? [];
  const classDays = new Set(rows.map((item) => madridDateKey(item.startsAt)));

  return (
    <main className="mx-auto max-w-5xl">
      <div className="hidden lg:block">
        <PageHeader
          title={capitalizeFirst(monthDays.monthName)}
          eyebrow="Agenda"
          action={
            <div className="flex gap-2">
              <Link href="/classes/series/new" className="rounded-xl border border-primary px-3 py-3 text-sm font-bold text-primary">Serie</Link>
              <Link href={`/classes/new?date=${selectedDay}`} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Añadir clase</Link>
            </div>
          }
        />
        <div className="mt-6 flex justify-end"><MonthNavigation year={year} month={month} /></div>
        <div className="mt-4 rounded-2xl border border-border bg-white p-4">
          <div className="grid grid-cols-7 gap-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <div key={day} className="py-2 text-center text-xs font-bold uppercase text-muted">{day}</div>)}
            {monthDays.cells.map((cell, index) => cell ? (
              <div key={cell.date} className={`min-h-28 rounded-xl border p-2 ${cell.isToday ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                <Link href={buildCalendarHref("/calendar", year, month, cell.date)} className="inline-flex min-h-11 min-w-11 items-center justify-center">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${cell.isToday ? "bg-primary text-white" : "text-slate-800"}`}>{cell.dayNumber}</span>
                </Link>
                <div className="mt-1 space-y-1">
                  {(byDay.get(cell.date) ?? []).slice(0, 3).map((item) => <Link key={item.id} href={`/classes/${item.id}`} className={`block truncate rounded-md px-1.5 py-1 text-[11px] font-bold ${item.status === "completed" ? "bg-primary-soft text-primary-hover" : item.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{madridTime(item.startsAt)} · {classTypeLabels[item.type]}</Link>)}
                </div>
              </div>
            ) : <div key={`empty-${index}`} className="min-h-28 rounded-xl border border-transparent" />)}
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <PageHeader title="Calendario" eyebrow="Agenda" />
        <WeekStrip days={stripDays} selectedDay={selectedDay} year={year} month={month} classDays={classDays} today={madridToday()} />
        <section className="mt-4">
          <h2 className="text-lg font-black">Clases del día</h2>
          {selectedClasses.length === 0 ? <p className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">No hay clases programadas.</p> : <div className="mt-3 space-y-3">{selectedClasses.map((item) => <Link key={item.id} href={`/classes/${item.id}`} className="block rounded-2xl border border-border bg-white p-4"><div className="flex items-center justify-between"><p className="font-black">{madridTime(item.startsAt)}</p><span className="text-xs font-bold text-muted">{classStatusLabels[item.status]}</span></div><p className="mt-1 text-sm text-muted">{classTypeLabels[item.type]}</p></Link>)}</div>}
        </section>
      </div>
    </main>
  );
}
