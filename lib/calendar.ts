import { format } from "date-fns";
import { es } from "date-fns/locale";
import { madridMonthKey, madridToday } from "@/lib/dates";

export type CalendarDay = { date: string; dayNumber: number; isToday: boolean };

export function parseCalendarMonth(year?: string, month?: string) {
  const current = madridMonthKey().split("-").map(Number);
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  return Number.isInteger(parsedYear) && Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? { year: parsedYear, month: parsedMonth } : { year: current[0], month: current[1] };
}

export function getPreviousMonth(year: number, month: number) { return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }; }
export function getNextMonth(year: number, month: number) { return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }; }

export function buildCalendarHref(path: string, year: number, month: number, day?: string) {
  const params = new URLSearchParams({ year: String(year), month: String(month) });
  if (day) params.set("day", day);
  return `${path}?${params.toString()}`;
}

export function getCalendarDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = first.getUTCDay() === 0 ? 6 : first.getUTCDay() - 1;
  const today = madridToday();
  const cells: (CalendarDay | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= total; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ date, dayNumber: day, isToday: date === today });
  }
  return { cells, monthName: format(first, "MMMM yyyy", { locale: es }) };
}
