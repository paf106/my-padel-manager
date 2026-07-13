"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";

const periodSchema = z.object({
  studentId: z.string().uuid(),
  year: z.coerce.number().int().min(1970).max(3000),
  month: z.coerce.number().int().min(1).max(12),
});

/**
 * Creates or updates a student's payment for a period (upsert via the
 * unique student+year+month constraint).
 */
export async function upsertPayment(formData: FormData) {
  const base = periodSchema.parse({
    studentId: formData.get("studentId"),
    year: formData.get("year"),
    month: formData.get("month"),
  });

  const amount = Math.max(0, Number(formData.get("amount")) || 0);
  const paid = formData.get("paid") === "on" || formData.get("paid") === "true";

  await db
    .insert(payments)
    .values({
      studentId: base.studentId,
      year: base.year,
      month: base.month,
      amount: amount.toFixed(2),
      paid,
      paidAt: paid ? new Date().toISOString().slice(0, 10) : null,
    })
    .onConflictDoUpdate({
      target: [payments.studentId, payments.year, payments.month],
      set: {
        amount: amount.toFixed(2),
        paid,
        paidAt: paid ? new Date().toISOString().slice(0, 10) : null,
      },
    });

  revalidatePath("/payments");
  revalidatePath(`/students/${base.studentId}`);
}

/** Toggles only the paid/pending state (creates the record if it doesn't exist). */
export async function togglePaid(formData: FormData) {
  const base = periodSchema.parse({
    studentId: formData.get("studentId"),
    year: formData.get("year"),
    month: formData.get("month"),
  });
  const paid = formData.get("paid") === "true";
  const amount = Math.max(0, Number(formData.get("amount")) || 0);

  await db
    .insert(payments)
    .values({
      studentId: base.studentId,
      year: base.year,
      month: base.month,
      amount: amount.toFixed(2),
      paid,
      paidAt: paid ? new Date().toISOString().slice(0, 10) : null,
    })
    .onConflictDoUpdate({
      target: [payments.studentId, payments.year, payments.month],
      set: {
        paid,
        paidAt: paid ? new Date().toISOString().slice(0, 10) : null,
      },
    });

  revalidatePath("/payments");
  revalidatePath(`/students/${base.studentId}`);
}

/** Deletes a student's payment record for a period. */
export async function clearPayment(formData: FormData) {
  const base = periodSchema.parse({
    studentId: formData.get("studentId"),
    year: formData.get("year"),
    month: formData.get("month"),
  });

  await db
    .delete(payments)
    .where(
      and(
        eq(payments.studentId, base.studentId),
        eq(payments.year, base.year),
        eq(payments.month, base.month)
      )
    );

  revalidatePath("/payments");
  revalidatePath(`/students/${base.studentId}`);
}
