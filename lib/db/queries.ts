import { and, asc, count, desc, eq, gte, ilike, inArray, lt, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  classStudents,
  classes,
  paymentClasses,
  payments,
  students,
  type ClassStatus,
  type ClassType,
  type Level,
} from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export async function listStudents(opts?: { search?: string; level?: Level }) {
  const filters = [];
  if (opts?.search) {
    const term = `%${opts.search}%`;
    filters.push(
      or(ilike(students.firstName, term), ilike(students.lastName, term))
    );
  }
  if (opts?.level) {
    filters.push(eq(students.level, opts.level));
  }

  return db
    .select()
    .from(students)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(students.firstName), asc(students.lastName));
}

export async function getStudent(id: string) {
  const [row] = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);
  return row ?? null;
}

/** Classes of a student, ordered from most to least recent. */
export async function getStudentClasses(studentId: string) {
  return db
    .select({
      id: classes.id,
      type: classes.type,
      status: classes.status,
      startsAt: classes.startsAt,
      durationMin: classes.durationMin,
      courtPrice: classes.courtPrice,
      classPrice: classes.classPrice,
      notes: classes.notes,
    })
    .from(classStudents)
    .innerJoin(classes, eq(classStudents.classId, classes.id))
    .where(eq(classStudents.studentId, studentId))
    .orderBy(desc(classes.startsAt));
}

export async function getStudentPayments(studentId: string) {
  return db
    .select({
      id: payments.id,
      amount: payments.amount,
      period: payments.period,
      paid: payments.paid,
      paidAt: payments.paidAt,
      notes: payments.notes,
    })
    .from(payments)
    .where(eq(payments.studentId, studentId))
    .orderBy(desc(payments.period));
}

export async function countStudents() {
  const [row] = await db.select({ value: count() }).from(students);
  return row?.value ?? 0;
}

// Minimal list (id + name) for selectors.
export async function listStudentsBasic() {
  return db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(students)
    .orderBy(asc(students.firstName), asc(students.lastName));
}

// Number of classes per student (to show in the list).
export async function classCountByStudent() {
  const rows = await db
    .select({
      studentId: classStudents.studentId,
      value: count(),
    })
    .from(classStudents)
    .groupBy(classStudents.studentId);

  return new Map(rows.map((r) => [r.studentId, r.value]));
}

// Marker to keep imports used across the app.
export { sql };

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export type ClassWithStudents = {
  id: string;
  type: ClassType;
  status: ClassStatus;
  startsAt: Date;
  durationMin: number;
  courtPrice: string;
  classPrice: string;
  notes: string | null;
  students: { id: string; firstName: string; lastName: string }[];
};

/** Attaches students to a set of classes using a single extra query. */
async function attachStudents<
  T extends { id: string }
>(classRows: T[]): Promise<(T & { students: ClassWithStudents["students"] })[]> {
  if (classRows.length === 0) return [];
  const ids = classRows.map((c) => c.id);

  const links = await db
    .select({
      classId: classStudents.classId,
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(classStudents)
    .innerJoin(students, eq(classStudents.studentId, students.id))
    .where(inArray(classStudents.classId, ids))
    .orderBy(asc(students.firstName));

  const byClass = new Map<string, ClassWithStudents["students"]>();
  for (const l of links) {
    const arr = byClass.get(l.classId) ?? [];
    arr.push({ id: l.id, firstName: l.firstName, lastName: l.lastName });
    byClass.set(l.classId, arr);
  }

  return classRows.map((c) => ({ ...c, students: byClass.get(c.id) ?? [] }));
}

export async function listClasses(opts?: {
  status?: ClassStatus;
  type?: ClassType;
  from?: Date;
  to?: Date;
}): Promise<ClassWithStudents[]> {
  const filters = [];
  if (opts?.status) filters.push(eq(classes.status, opts.status));
  if (opts?.type) filters.push(eq(classes.type, opts.type));
  if (opts?.from) filters.push(gte(classes.startsAt, opts.from));
  if (opts?.to) filters.push(lt(classes.startsAt, opts.to));

  const rows = await db
    .select()
    .from(classes)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(classes.startsAt));

  return attachStudents(rows);
}

export async function getClass(id: string): Promise<ClassWithStudents | null> {
  const [row] = await db
    .select()
    .from(classes)
    .where(eq(classes.id, id))
    .limit(1);
  if (!row) return null;
  const [withStudents] = await attachStudents([row]);
  return withStudents;
}

export async function countClasses() {
  const [row] = await db.select({ value: count() }).from(classes);
  return row?.value ?? 0;
}

/** Classes of a specific month (year, month 1-12), ordered by date ascending. */
export async function listClassesForMonth(
  year: number,
  month: number
): Promise<ClassWithStudents[]> {
  const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const to = new Date(year, month, 1, 0, 0, 0, 0);

  const rows = await db
    .select()
    .from(classes)
    .where(and(gte(classes.startsAt, from), lt(classes.startsAt, to)))
    .orderBy(asc(classes.startsAt));

  return attachStudents(rows);
}

/** Upcoming classes from now on (for the dashboard). */
export async function listUpcomingClasses(limit = 5): Promise<ClassWithStudents[]> {
  const rows = await db
    .select()
    .from(classes)
    .where(gte(classes.startsAt, new Date()))
    .orderBy(asc(classes.startsAt))
    .limit(limit);

  return attachStudents(rows);
}

// ---------------------------------------------------------------------------
// Monthly payments
// ---------------------------------------------------------------------------

export type StudentPaymentRow = {
  id: string;
  amount: string;
  period: string;
  paid: boolean;
  paidAt: string | null;
  notes: string | null;
  student: { id: string; firstName: string; lastName: string };
  classes: { id: string; startsAt: Date; amount: string }[];
};

export async function listCompletedClassesForMonth(year: number, month: number): Promise<ClassWithStudents[]> {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);
  const rows = await db.select().from(classes)
    .where(and(eq(classes.status, "completed"), gte(classes.startsAt, from), lt(classes.startsAt, to)))
    .orderBy(asc(classes.startsAt));
  return attachStudents(rows);
}

export async function listPayments(year: number, month: number): Promise<StudentPaymentRow[]> {
  const period = `${year}-${String(month).padStart(2, "0")}-01`;
  const rows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      period: payments.period,
      paid: payments.paid,
      paidAt: payments.paidAt,
      notes: payments.notes,
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      classId: classes.id,
      startsAt: classes.startsAt,
      lineAmount: paymentClasses.amount,
    })
    .from(payments)
    .innerJoin(students, eq(payments.studentId, students.id))
    .leftJoin(paymentClasses, eq(paymentClasses.paymentId, payments.id))
    .leftJoin(classes, eq(paymentClasses.classId, classes.id))
    .where(eq(payments.period, period))
    .orderBy(asc(students.firstName), asc(classes.startsAt));

  const byPayment = new Map<string, StudentPaymentRow>();
  for (const row of rows) {
    const payment = byPayment.get(row.id) ?? {
      id: row.id,
      amount: row.amount,
      paid: row.paid,
      paidAt: row.paidAt,
      notes: row.notes,
      period: row.period,
      student: { id: row.studentId, firstName: row.firstName, lastName: row.lastName },
      classes: [],
    };
    if (row.classId && row.startsAt && row.lineAmount && !payment.classes.some((cls) => cls.id === row.classId)) {
      payment.classes.push({ id: row.classId, startsAt: row.startsAt, amount: row.lineAmount });
    }
    byPayment.set(row.id, payment);
  }
  return [...byPayment.values()];
}

/** Income totals for all payment records. */
export async function paymentTotals(year?: number, month?: number) {
  const period = year && month ? `${year}-${String(month).padStart(2, "0")}-01` : undefined;
  const rows = await db
    .select({ amount: payments.amount, paid: payments.paid })
    .from(payments)
    .where(period ? eq(payments.period, period) : undefined);

  let collected = 0;
  let pending = 0;
  for (const r of rows) {
    const n = Number(r.amount) || 0;
    if (r.paid) collected += n;
    else pending += n;
  }
  return { collected, pending, total: collected + pending };
}

/** Total income collected in a year (by month), for the dashboard. */
export async function collectedByMonth(year: number) {
  const rows = await db
    .select({ month: sql<number>`EXTRACT(MONTH FROM ${payments.paidAt})`, amount: payments.amount, paid: payments.paid })
    .from(payments)
    .where(and(eq(payments.paid, true), sql`EXTRACT(YEAR FROM ${payments.paidAt}) = ${year}`));

  const byMonth = new Array(12).fill(0) as number[];
  for (const r of rows) {
    if (r.paid) byMonth[r.month - 1] += Number(r.amount) || 0;
  }
  return byMonth;
}
