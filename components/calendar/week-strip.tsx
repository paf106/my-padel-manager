import Link from "next/link";
import { Plus } from "lucide-react";
import { buildCalendarHref, getWeekStartKey, type StripDay } from "@/lib/calendar";
import { Fab } from "@/components/ui/fab";
import { StripScroller } from "./strip-scroller";
import { MonthPicker } from "./month-picker";

export function WeekStrip({ days, selectedDay, year, month, classDays, today }: { days: StripDay[]; selectedDay: string; year: number; month: number; classDays: Set<string>; today: string }) {
  const weeks = Array.from(new Set(days.map((day) => day.weekStart)));
  const daysByWeek = new Map<string, StripDay[]>();
  for (const day of days) daysByWeek.set(day.weekStart, [...(daysByWeek.get(day.weekStart) ?? []), day]);
  const weekIndex = weeks.indexOf(getWeekStartKey(selectedDay));

  return (
    <section className="lg:hidden">
      <div className="flex items-center justify-center">
        <MonthPicker year={year} month={month} selectedDay={selectedDay} today={today} classDays={[...classDays]} />
      </div>
      <StripScroller weekIndex={weekIndex}>
        {weeks.map((weekStart) => (
          <div key={weekStart} className="grid min-w-full snap-center grid-cols-7 gap-1">
            {daysByWeek.get(weekStart)?.map((day) => (
              <Link key={day.date} href={buildCalendarHref("/calendar", year, month, day.date)} className="flex min-h-20 flex-col items-center justify-center gap-1">
                <span className={`text-sm capitalize ${day.date === selectedDay ? "text-emerald-700" : "text-slate-700"}`}>{day.weekdayLabel}</span>
                <span className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${day.date === selectedDay ? "bg-emerald-800 text-white" : day.isToday ? "ring-2 ring-emerald-800" : ""}`}>{day.dayNumber}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${classDays.has(day.date) ? "bg-lime-500" : "bg-transparent"}`} />
              </Link>
            ))}
          </div>
        ))}
      </StripScroller>
      <Fab href={`/classes/new?date=${selectedDay}`} label="Nueva clase" icon={Plus} />
    </section>
  );
}
