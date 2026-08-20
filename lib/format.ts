import {
  format,
  formatDistanceToNowStrict,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

/** Formats a number or numeric string as euro currency. */
export function formatCurrency(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return currencyFormatter.format(Number.isFinite(n as number) ? (n as number) : 0);
}

/** Safely converts a DB numeric (string) to a number. */
export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

function asDate(value: Date | string): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

/** dd/MM/yyyy */
export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return format(asDate(value), "dd/MM/yyyy", { locale: es });
}

/** dd/MM/yyyy HH:mm */
export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return format(asDate(value), "dd/MM/yyyy HH:mm", { locale: es });
}

/** HH:mm */
export function formatTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return format(asDate(value), "HH:mm", { locale: es });
}

/** e.g. "lunes, 6 de julio" */
export function formatLongDay(value: Date | string) {
  return format(asDate(value), "EEEE, d 'de' MMMM", { locale: es });
}

/** Value for <input type="datetime-local"> from a Date. */
export function toDatetimeLocalValue(value: Date | string | null | undefined) {
  if (!value) return "";
  return format(asDate(value), "yyyy-MM-dd'T'HH:mm");
}

/** Month name (in Spanish, for the UI) from its number (1-12). */
export function monthName(month: number) {
  const d = new Date(2000, month - 1, 1);
  return format(d, "MMMM", { locale: es });
}

/** Age in years from the birth date. */
export function ageFromBirthDate(
  value: Date | string | null | undefined
): number | null {
  if (!value) return null;
  const birth = asDate(value);
  const diff = Date.now() - birth.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return age >= 0 && age < 130 ? age : null;
}

export { formatDistanceToNowStrict };

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------

/** Full name of a student. */
export function fullName(s: {
  firstName: string;
  lastName?: string | null;
}): string {
  return [s.firstName, s.lastName].filter(Boolean).join(" ").trim();
}

/** Teacher revenue after the court is reimbursed separately by the student. */
export function classProfit(c: {
  classPrice: string | number;
  courtPrice: string | number;
}): number {
  return toNumber(c.classPrice);
}

/** Total charged for a class before splitting it between students. */
export function classTotal(c: { classPrice: string | number; courtPrice: string | number }) {
  return toNumber(c.classPrice) + toNumber(c.courtPrice);
}
