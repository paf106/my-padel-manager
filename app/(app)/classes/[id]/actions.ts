"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { classStudents, students } from "@/lib/db/schema";
import { validateClassStudentCount } from "@/lib/billing";
import { z } from "zod";
import { inArray } from "drizzle-orm";

export async function updateClassStatus(id: string, status: "pending" | "cancelled" | "completed") {
  await db.update(classes).set({ status, updatedAt: new Date() }).where(eq(classes.id, id));
  revalidatePath("/"); revalidatePath("/calendar"); revalidatePath(`/classes/${id}`);
}

export async function updateClassNotes(id: string, formData: FormData) {
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 1000);
  await db.update(classes).set({ notes: notes || null, updatedAt: new Date() }).where(and(eq(classes.id, id), eq(classes.status, "completed")));
  revalidatePath(`/classes/${id}`);
}

export async function deleteClass(id: string) {
  await db.delete(classes).where(eq(classes.id, id));
  revalidatePath("/"); revalidatePath("/calendar");
  redirect("/calendar");
}

const editSchema = z.object({
  type: z.enum(["individual", "pair", "group"]),
  startsAt: z.string().min(1),
  durationMin: z.coerce.number().int().positive(),
  courtPriceCents: z.coerce.number().int().nonnegative(),
  ratePerStudentCents: z.coerce.number().int().nonnegative(),
  notes: z.string().trim().max(1000).optional(),
});

export async function updateClass(id: string, formData: FormData) {
  const studentIds = formData.getAll("studentIds").map(String);
  const raw = Object.fromEntries(formData);
  const result = editSchema.safeParse({ ...raw, courtPriceCents: Math.round(Number(raw.courtPriceCents) * 100), ratePerStudentCents: Math.round(Number(raw.ratePerStudentCents) * 100) });
  const startsAt = result.success ? new Date(result.data.startsAt) : null;
  if (!result.success || !startsAt || Number.isNaN(startsAt.getTime()) || !validateClassStudentCount(result.data.type, studentIds.length)) redirect(`/classes/${id}/edit?error=invalid`);
  if (studentIds.length !== new Set(studentIds).size) redirect(`/classes/${id}/edit?error=invalid`);
  const validStudents = await db.select({ id: students.id }).from(students).where(inArray(students.id, studentIds));
  if (validStudents.length !== new Set(studentIds).size) redirect(`/classes/${id}/edit?error=invalid`);
  await db.transaction(async (tx) => {
    await tx.update(classes).set({ ...result.data, startsAt, notes: result.data.notes || null, updatedAt: new Date() }).where(eq(classes.id, id));
    await tx.delete(classStudents).where(eq(classStudents.classId, id));
    await tx.insert(classStudents).values(studentIds.map((studentId) => ({ classId: id, studentId })));
  });
  revalidatePath("/"); revalidatePath("/calendar"); revalidatePath(`/classes/${id}`);
  redirect(`/classes/${id}`);
}
