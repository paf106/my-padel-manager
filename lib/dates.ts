import { addMonths, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const MADRID_TIME_ZONE = "Europe/Madrid";

export function madridDateKey(date: Date) {
  return format(toZonedTime(date, MADRID_TIME_ZONE), "yyyy-MM-dd");
}

export function madridTime(date: Date) {
  return format(toZonedTime(date, MADRID_TIME_ZONE), "HH:mm");
}

export function madridToday() {
  return madridDateKey(new Date());
}

export function madridMonthRange(date = new Date()) {
  const madridDate = toZonedTime(date, MADRID_TIME_ZONE);
  return {
    start: fromZonedTime(startOfMonth(madridDate), MADRID_TIME_ZONE),
    end: fromZonedTime(endOfMonth(madridDate), MADRID_TIME_ZONE),
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
