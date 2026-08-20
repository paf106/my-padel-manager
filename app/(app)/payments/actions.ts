"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { z } from "zod";

import { requireAuthenticated } from "@/lib/auth";
import { buildMonthlyDraft, type MonthlyDraft } from "@/lib/billing";
import { db } from "@/lib/db";
import { classStudents, classes, paymentClasses, payments, students } from "@/lib/db/schema";

const monthSchema = z.object({
  year: z.coerce.number().int().min(1970).max(3000),
  month: z.coerce.number().int().min(1).max(12),
  studentIds: z.array(z.string().uuid()).min(1, "Selecciona al menos un alumno").max(500),
});

export type PaymentFormState = { ok: boolean; error?: string; fieldErrors?: Record<string, string[]> };

function parseMonth(formData: FormData) {
  return monthSchema.safeParse({
    year: formData.get("year"), month: formData.get("month"),
    studentIds: [...new Set(formData.getAll("studentIds").map(String))],
  });
}

async function getDrafts(year: number, month: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);
  const rows = await db.select().from(classes)
    .where(and(eq(classes.status, "completed"), gte(classes.startsAt, from), lt(classes.startsAt, to)))
    .orderBy(classes.startsAt);
  if (!rows.length) return [] as MonthlyDraft[];
  const links = await db.select({ classId: classStudents.classId, studentId: classStudents.studentId, firstName: students.firstName, lastName: students.lastName })
    .from(classStudents)
    .innerJoin(students, eq(classStudents.studentId, students.id))
    .where(inArray(classStudents.classId, rows.map((row) => row.id)));
  const studentsByClass = new Map<string, { id: string; firstName: string; lastName: string }[]>();
  for (const link of links) {
    const list = studentsByClass.get(link.classId) ?? [];
    list.push({ id: link.studentId, firstName: link.firstName, lastName: link.lastName });
    studentsByClass.set(link.classId, list);
  }
  return buildMonthlyDraft(rows.map((row) => ({ ...row, students: studentsByClass.get(row.id) ?? [] })));
}

export async function generateMonthlyPayments(_prev: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  await requireAuthenticated();
  const parsed = parseMonth(formData);
  if (!parsed.success) return { ok: false, error: "Revisa la selección.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { year, month, studentIds } = parsed.data;
  const period = `${year}-${String(month).padStart(2, "0")}-01`;
  const drafts = (await getDrafts(year, month)).filter((draft) => studentIds.includes(draft.studentId));
  if (!drafts.length) return { ok: false, error: "No hay clases completadas para los alumnos seleccionados." };

  try {
    await db.transaction(async (tx) => {
      for (const draft of drafts) {
        const [payment] = await tx.insert(payments).values({ studentId: draft.studentId, period, amount: draft.total }).onConflictDoNothing({ target: [payments.studentId, payments.period] }).returning({ id: payments.id });
        if (!payment) continue;
        await tx.insert(paymentClasses).values(draft.lines.map((line) => ({ paymentId: payment.id, classId: line.classId, classPrice: line.classPrice, courtPrice: line.courtPrice, studentCount: line.studentCount, amount: line.amount })));
      }
    });
  } catch { return { ok: false, error: "No se pudieron crear los pagos. Inténtalo de nuevo." }; }
  revalidatePath("/payments"); revalidatePath("/students");
  return { ok: true };
}

export async function recalculatePayment(id: string): Promise<PaymentFormState> {
  await requireAuthenticated();
  const paymentId = z.string().uuid().parse(id);
  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment) return { ok: false, error: "El pago no existe." };
  const period = new Date(`${payment.period}T00:00:00`);
  const drafts = await getDrafts(period.getFullYear(), period.getMonth() + 1);
  const draft = drafts.find((item) => item.studentId === payment.studentId);
  if (!draft) return { ok: false, error: "No hay clases completadas para recalcular este pago." };
  await db.transaction(async (tx) => {
    await tx.delete(paymentClasses).where(eq(paymentClasses.paymentId, paymentId));
    await tx.update(payments).set({ amount: draft.total }).where(eq(payments.id, paymentId));
    await tx.insert(paymentClasses).values(draft.lines.map((line) => ({ paymentId, classId: line.classId, classPrice: line.classPrice, courtPrice: line.courtPrice, studentCount: line.studentCount, amount: line.amount })));
  });
  revalidatePath("/payments"); revalidatePath("/students");
  return { ok: true };
}

export async function togglePaymentPaid(id: string, paid: boolean) {
  await requireAuthenticated();
  const paymentId = z.string().uuid().parse(id);
  await db.update(payments).set({ paid, paidAt: paid ? new Date().toISOString().slice(0, 10) : null }).where(eq(payments.id, paymentId));
  revalidatePath("/payments"); revalidatePath("/students");
}

export async function deletePayment(id: string) {
  await requireAuthenticated();
  await db.delete(payments).where(eq(payments.id, z.string().uuid().parse(id)));
  revalidatePath("/payments"); revalidatePath("/students");
}
