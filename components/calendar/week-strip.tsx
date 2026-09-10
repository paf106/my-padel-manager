import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { buildCalendarHref, type StripDay } from "@/lib/calendar";
import { StripScroller } from "./strip-scroller";

export function WeekStrip({ days, selectedDay, year, month, classDays }: { days: StripDay[]; selectedDay: string; year: number; month: number; classDays: Set<string> }) {
  const selected = new Date(`${selectedDay}T00:00:00.000Z`);
  const title = selected.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
  const weeks = Array.from(new Set(days.map((day) => day.weekStart)));
  return <section className="lg:hidden"><div className="flex items-center justify-center gap-2"><span className="text-lg font-bold capitalize">{title}</span><Link href={`${buildCalendarHref("/calendar", year, month, selectedDay)}&view=month`} aria-label="Mostrar mes completo"><ChevronDown size={20} className="text-slate-500" /></Link></div><StripScroller selectedWeek={days.find((day) => day.date === selectedDay)?.weekStart}><div className="flex min-w-full snap-x snap-mandatory overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{weeks.map((weekStart) => <div key={weekStart} data-week={weekStart} className="grid min-w-full snap-center grid-cols-7 gap-1"><>{days.filter((day) => day.weekStart === weekStart).map((day) => <Link key={day.date} href={buildCalendarHref("/calendar", year, month, day.date)} className="flex min-h-20 flex-col items-center justify-center gap-1"><span className={`text-sm capitalize ${day.date === selectedDay ? "text-emerald-700" : "text-slate-700"}`}>{day.weekdayLabel}</span><span className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${day.date === selectedDay ? "bg-sky-500 text-white" : day.isToday ? "ring-2 ring-emerald-800" : ""}`}>{day.dayNumber}</span>{classDays.has(day.date) && <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />}</Link>)}</></div>)}</div></StripScroller><p className="text-center text-sm text-slate-500">{classDays.has(selectedDay) ? `${classDays.size > 0 ? "" : ""}` : "0"} clases</p></section>;
}
