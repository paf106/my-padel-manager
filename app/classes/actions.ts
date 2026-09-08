"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { classStudents, classes } from "@/lib/db/schema";
import { validateClassStudentCount } from "@/lib/billing";

const schema = z.object({
  type: z.enum(["individual", "pair", "group"]),
  startsAt: z.string().min(1),
  durationMin: z.coerce.number().int().positive(),
  courtPriceCents: z.coerce.number().int().nonnegative(),
  ratePerStudentCents: z.coerce.number().int().nonnegative(),
  notes: z.string().trim().max(1000).optional(),
});

export async function createClass(formData: FormData) {
  const studentIds = formData.getAll("studentIds").map(String);
  const raw = Object.fromEntries(formData);
  const result = schema.safeParse({
    ...raw,
    courtPriceCents: Math.round(Number(raw.courtPriceCents) * 100),
    ratePerStudentCents: Math.round(Number(raw.ratePerStudentCents) * 100),
  });
  if (!result.success || !validateClassStudentCount(result.data.type, studentIds.length)) redirect("/classes/new?error=invalid");
  const startsAt = new Date(result.data.startsAt);
  if (Number.isNaN(startsAt.getTime())) redirect("/classes/new?error=invalid");
  await db.transaction(async (tx) => {
    const [created] = await tx.insert(classes).values({ ...result.data, startsAt, notes: result.data.notes || null }).returning({ id: classes.id });
    await tx.insert(classStudents).values(studentIds.map((studentId) => ({ classId: created.id, studentId })));
  });
  revalidatePath("/"); revalidatePath("/calendar");
  redirect("/calendar");
}
