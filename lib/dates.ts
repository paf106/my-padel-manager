import { addMonths, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const MADRID_TIME_ZONE = "Europe/Madrid";

export function madridDateKey(date: Date) {
  return format(toZonedTime(date, MADRID_TIME_ZONE), "yyyy-MM-dd");
}

export function madridTime(date: Date) {
  return format(toZonedTime(date, MADRID_TIME_ZONE), "HH:mm");
}

export function madridFromLocalInput(value: string) {
  return fromZonedTime(value.length === 16 ? `${value}:00` : value, MADRID_TIME_ZONE);
}

export function madridLocalInputValue(date: Date) {
  return format(toZonedTime(date, MADRID_TIME_ZONE), "yyyy-MM-dd'T'HH:mm");
}

export function madridSeriesDateKeys(startsOn: string, weekday: number, weeks: number) {
  const start = new Date(`${startsOn}T00:00:00Z`);
  const currentWeekday = start.getUTCDay();
  const offset = (weekday - currentWeekday + 7) % 7;
  start.setUTCDate(start.getUTCDate() + offset);
  return Array.from({ length: weeks }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index * 7);
    return date.toISOString().slice(0, 10);
  });
}

export function madridToday() {
  return madridDateKey(new Date());
}

export function madridUpcomingRange(date = new Date(), days = 7) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  const startKey = format(madridDate, "yyyy-MM-dd");
  const endDate = new Date(madridDate);
  endDate.setDate(endDate.getDate() + days);
  const endKey = format(endDate, "yyyy-MM-dd");
  return {
    start: fromZonedTime(`${startKey}T00:00:00`, MADRID_TIME_ZONE),
    end: fromZonedTime(`${endKey}T00:00:00`, MADRID_TIME_ZONE),
  };
}

export function madridMonthRange(date = new Date()) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  return {
    start: fromZonedTime(startOfMonth(madridDate), MADRID_TIME_ZONE),
    end: fromZonedTime(endOfMonth(madridDate), MADRID_TIME_ZONE),
  };
}

export function madridMonthWindow(date = new Date(), monthsBefore = 12, monthsAfter = 12) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  return {
    start: fromZonedTime(startOfMonth(subMonths(madridDate, monthsBefore)), MADRID_TIME_ZONE),
    end: fromZonedTime(startOfMonth(addMonths(madridDate, monthsAfter + 1)), MADRID_TIME_ZONE),
  };
}

export function madridMonthKey(date = new Date()) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  return `${madridDate.getFullYear()}-${String(madridDate.getMonth() + 1).padStart(2, "0")}`;
}

export function madridMonthStartKey(date = new Date()) {
  return `${madridMonthKey(date)}-01`;
}

export function madridNextMonthStartKey(date = new Date()) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  return format(addMonths(startOfMonth(madridDate), 1), "yyyy-MM-dd");
}

export function madridRecentMonthStart(date = new Date(), months = 5) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  return fromZonedTime(startOfMonth(subMonths(madridDate, months)), MADRID_TIME_ZONE);
}

export function madridRecentMonthStartKey(date = new Date(), months = 5) {
  return format(toZonedTime(madridRecentMonthStart(date, months), MADRID_TIME_ZONE), "yyyy-MM-dd");
}

export function madridMonthKeys(date = new Date(), count = 6) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  return Array.from({ length: count }, (_, index) =>
    format(subMonths(startOfMonth(madridDate), count - 1 - index), "yyyy-MM"),
  );
}
