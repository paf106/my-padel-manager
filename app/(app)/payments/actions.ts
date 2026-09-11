"use server";

import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { buildBillingLines } from "@/lib/billing";
import { classStudents, classes, paymentLines, payments } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { madridMonthRange } from "@/lib/dates";
import { z } from "zod";

export async function generateMonthlyPayments(period: string) {
  await requireUser();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw new Error("Periodo de pagos no válido");
  const monthStart = new Date(`${period}-01T12:00:00.000Z`);
  const { start: periodStart, end: periodEnd } = madridMonthRange(monthStart);
  const completed = await db
    .select({ padelClass: classes, studentId: classStudents.studentId })
    .from(classes)
    .innerJoin(classStudents, eq(classes.id, classStudents.classId))
    .where(
      and(
        eq(classes.status, "completed"),
        gte(classes.startsAt, periodStart),
        lt(classes.startsAt, periodEnd),
      ),
    );
  const grouped = new Map<string, typeof completed>();
  for (const row of completed)
    grouped.set(row.padelClass.id, [...(grouped.get(row.padelClass.id) ?? []), row]);
  const billingClasses = [...grouped.values()].map((rows) => ({
    id: rows[0].padelClass.id,
    type: rows[0].padelClass.type,
    courtPriceCents: rows[0].padelClass.courtPriceCents,
    ratePerStudentCents: rows[0].padelClass.ratePerStudentCents,
    studentIds: rows.map((row) => row.studentId).sort(),
  }));
  // Invalid classes still fail the whole transaction instead of creating a partial monthly bill.
  const lines = buildBillingLines(billingClasses);
  const totals = new Map<string, number>();
  for (const line of lines)
    totals.set(line.studentId, (totals.get(line.studentId) ?? 0) + line.amountCents);
  await db.transaction(async (tx) => {
    const existing = await tx
      .select({
        id: payments.id,
        studentId: payments.studentId,
        paidAmountCents: payments.paidAmountCents,
      })
      .from(payments)
      .where(eq(payments.period, `${period}-01`));
    const pendingStudentIds = [...totals.keys()].filter(
      (studentId) =>
        !(existing.find((payment) => payment.studentId === studentId)?.paidAmountCents ?? 0),
    );
    const pendingRows = pendingStudentIds.map((studentId) => ({
      studentId,
      period: `${period}-01`,
      computedAmountCents: totals.get(studentId)!,
    }));
    const updatedPayments =
      pendingRows.length === 0
        ? []
        : await tx
            .insert(payments)
            .values(pendingRows)
            .onConflictDoUpdate({
              target: [payments.studentId, payments.period],
              set: {
                computedAmountCents: sql`excluded.computed_amount_cents`,
                updatedAt: new Date(),
              },
            })
            .returning({ id: payments.id, studentId: payments.studentId });
    const paymentIds = updatedPayments.map((payment) => payment.id);
    if (paymentIds.length > 0) {
      await tx.delete(paymentLines).where(inArray(paymentLines.paymentId, paymentIds));
      const nextLines = updatedPayments.flatMap((payment) =>
        lines
          .filter((line) => line.studentId === payment.studentId)
          .map((line) => ({
            paymentId: payment.id,
            classId: line.classId,
            studentCount: grouped.get(line.classId)?.length ?? 0,
            classShareCents: line.classShareCents,
            courtShareCents: line.courtShareCents,
            amountCents: line.amountCents,
          })),
      );
      if (nextLines.length > 0) await tx.insert(paymentLines).values(nextLines);
    }
    for (const payment of existing.filter(({ studentId }) => !totals.has(studentId))) {
      if (payment.paidAmountCents > 0) {
        continue;
      } else {
        await tx.delete(paymentLines).where(eq(paymentLines.paymentId, payment.id));
        await tx.delete(payments).where(eq(payments.id, payment.id));
      }
    }
  });
  revalidatePath("/payments");
}

export async function deletePayment(id: string) {
  await requireUser();
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) throw new Error("Identificador de pago no válido");
  await db.delete(payments).where(eq(payments.id, id));
  revalidatePath("/payments");
}
