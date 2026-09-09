"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { buildBillingLines } from "@/lib/billing";
import { classStudents, classes, paymentLines, payments } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { madridMonthRange } from "@/lib/dates";
import { redirect } from "next/navigation";

export async function generateMonthlyPayments(period: string) {
  await requireUser();
  const monthStart = new Date(`${period}-01T12:00:00.000Z`);
  const { start: periodStart, end: periodEnd } = madridMonthRange(monthStart);
  const completed = await db.select({ padelClass: classes, studentId: classStudents.studentId }).from(classes).innerJoin(classStudents, eq(classes.id, classStudents.classId)).where(and(eq(classes.status, "completed"), gte(classes.startsAt, periodStart), lt(classes.startsAt, periodEnd)));
  const grouped = new Map<string, typeof completed>();
  for (const row of completed) grouped.set(row.padelClass.id, [...(grouped.get(row.padelClass.id) ?? []), row]);
  const lines = buildBillingLines([...grouped.values()].map((rows) => ({ id: rows[0].padelClass.id, type: rows[0].padelClass.type, courtPriceCents: rows[0].padelClass.courtPriceCents, ratePerStudentCents: rows[0].padelClass.ratePerStudentCents, studentIds: rows.map((row) => row.studentId) })));
  const totals = new Map<string, number>();
  for (const line of lines) totals.set(line.studentId, (totals.get(line.studentId) ?? 0) + line.amountCents);
  await db.transaction(async (tx) => {
    for (const [studentId, amount] of totals) {
      const [payment] = await tx.insert(payments).values({ studentId, period: `${period}-01`, computedAmountCents: amount }).onConflictDoUpdate({ target: [payments.studentId, payments.period], set: { computedAmountCents: amount, updatedAt: new Date() } }).returning({ id: payments.id });
      await tx.delete(paymentLines).where(eq(paymentLines.paymentId, payment.id));
      await tx.insert(paymentLines).values(lines.filter((line) => line.studentId === studentId).map((line) => ({ paymentId: payment.id, classId: line.classId, studentCount: grouped.get(line.classId)?.length ?? 0, classShareCents: line.classShareCents, courtShareCents: line.courtShareCents, amountCents: line.amountCents })));
    }
  });
  revalidatePath("/payments");
}

export async function deletePayment(id: string) {
  await requireUser();
  await db.delete(payments).where(eq(payments.id, id));
  revalidatePath("/payments");
  redirect("/payments");
}
