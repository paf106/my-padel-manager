import { format } from "date-fns";
import { es } from "date-fns/locale";
import { madridMonthKey, madridToday } from "@/lib/dates";

export type CalendarDay = { date: string; dayNumber: number; isToday: boolean };
export type StripDay = CalendarDay & { weekdayLabel: string; weekStart: string };

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

function addDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function getWeekStartKey(dateKey: string) {
  const weekday = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return addDays(dateKey, weekday === 0 ? -6 : 1 - weekday);
}

export function getStripDays(selectedDay: string) {
  const selected = new Date(`${selectedDay}T00:00:00.000Z`);
  const monthBefore = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() - 1, 1));
  const monthAfter = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + 2, 0));
  const firstKey = `${monthBefore.getUTCFullYear()}-${String(monthBefore.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const lastKey = `${monthAfter.getUTCFullYear()}-${String(monthAfter.getUTCMonth() + 1).padStart(2, "0")}-${String(monthAfter.getUTCDate()).padStart(2, "0")}`;
  let current = getWeekStartKey(firstKey);
  const last = addDays(lastKey, 6 - (new Date(`${lastKey}T00:00:00.000Z`).getUTCDay() === 0 ? 6 : new Date(`${lastKey}T00:00:00.000Z`).getUTCDay() - 1));
  const days: StripDay[] = [];
  while (current <= last) {
    const date = new Date(`${current}T00:00:00.000Z`);
    const dateKey = current;
    days.push({ date: dateKey, dayNumber: date.getUTCDate(), isToday: dateKey === madridToday(), weekdayLabel: format(date, "EEE", { locale: es }), weekStart: getWeekStartKey(dateKey) });
    current = addDays(current, 1);
  }
  return days;
}
