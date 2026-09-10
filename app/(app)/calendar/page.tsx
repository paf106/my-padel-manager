import Link from "next/link";
import { and, asc, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { classTypeLabels, classStatusLabels } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { MonthNavigation } from "@/components/calendar/month-navigation";
import { WeekStrip } from "@/components/calendar/week-strip";
import { buildCalendarHref, getCalendarDays, getStripDays, parseCalendarMonth } from "@/lib/calendar";
import { madridDateKey, madridMonthRange, madridTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string; day?: string; view?: string }> }) {
  const params = await searchParams;
  const { year, month } = parseCalendarMonth(params.year, params.month);
  const monthDays = getCalendarDays(year, month);
  const selectedDay = params.day ?? monthDays.cells.find((cell) => cell?.isToday)?.date ?? monthDays.cells.find(Boolean)?.date ?? `${year}-${String(month).padStart(2, "0")}-01`;
  const stripDays = getStripDays(selectedDay);
  const firstStrip = new Date(`${stripDays[0].date}T00:00:00.000Z`);
  const lastStrip = new Date(`${stripDays.at(-1)!.date}T00:00:00.000Z`);
  const rangeStart = madridMonthRange(firstStrip).start;
  const rangeEnd = madridMonthRange(lastStrip).end;
  const rows = await db.select().from(classes).where(and(gte(classes.startsAt, rangeStart), lt(classes.startsAt, rangeEnd))).orderBy(asc(classes.startsAt));
  const byDay = new Map<string, typeof rows>();
  for (const item of rows) { const key = madridDateKey(item.startsAt); byDay.set(key, [...(byDay.get(key) ?? []), item]); }
  const selectedClasses = byDay.get(selectedDay) ?? [];
  const classDays = new Set(byDay.keys());
  const showMonth = params.view === "month";
  return <main className="mx-auto min-h-screen max-w-5xl"><PageHeader title={monthDays.monthName} eyebrow="Agenda" action={<div className="flex gap-2"><Link href="/classes/series/new" className="hidden rounded-xl border border-emerald-800 px-3 py-3 text-sm font-bold text-emerald-800 sm:inline-flex">Serie</Link><Link href="/classes/new" className="hidden rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white sm:inline-flex">Añadir clase</Link></div>} /><div className="hidden justify-end lg:flex"><MonthNavigation year={year} month={month} /></div>{showMonth ? <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-2 sm:p-4 lg:mt-4"><div className="grid grid-cols-7 gap-1 lg:gap-2">{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <div key={day} className="py-2 text-center text-[10px] font-bold uppercase text-slate-500 sm:text-xs">{day}</div>)}{monthDays.cells.map((cell, index) => cell ? <div key={cell.date} className={`min-h-16 rounded-xl border p-1 sm:min-h-24 sm:p-2 lg:min-h-28 ${cell.isToday ? "border-emerald-800 ring-2 ring-emerald-900/20" : "border-slate-200"}`}><Link href={buildCalendarHref("/calendar", year, month, cell.date)} className="inline-flex min-h-11 min-w-11 items-center justify-center"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm ${cell.isToday ? "bg-emerald-800 text-white" : "text-slate-800"}`}>{cell.dayNumber}</span></Link></div> : <div key={`empty-${index}`} className="min-h-16 rounded-xl border border-transparent sm:min-h-24 lg:min-h-28" />)}</div></div> : <WeekStrip days={stripDays} selectedDay={selectedDay} year={year} month={month} classDays={classDays} />}<section className="mt-6"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Clases del día</h2><span className="text-sm text-slate-500">{selectedClasses.length} {selectedClasses.length === 1 ? "clase" : "clases"}</span></div>{selectedClasses.length === 0 ? <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No hay clases este día.</div> : <div className="mt-3 space-y-2">{selectedClasses.map((item) => <Link key={item.id} href={`/classes/${item.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4"><p className="font-black">{madridTime(item.startsAt)} · {classTypeLabels[item.type]}</p><p className="mt-1 text-sm text-slate-500">{classStatusLabels[item.status]}</p></Link>)}</div>}</section></main>;
}
