"use server";

import { addWeeks, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { classSeries, classStudents, classes, students } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const seriesSchema = z.object({
  type: z.enum(["individual", "pair", "group"]), weekday: z.coerce.number().int().min(0).max(6), timeOfDay: z.string().regex(/^\d{2}:\d{2}$/), startsOn: z.string().min(1), weeks: z.coerce.number().int().min(1).max(52), durationMin: z.coerce.number().int().positive(), courtPriceCents: z.coerce.number().int().nonnegative(), ratePerStudentCents: z.coerce.number().int().nonnegative(),
});

export async function createSeries(formData: FormData) {
  const studentIds = formData.getAll("studentIds").map(String);
  const raw = Object.fromEntries(formData);
  const result = seriesSchema.safeParse({ ...raw, weekday: Number(raw.weekday), weeks: Number(raw.weeks), durationMin: Number(raw.durationMin), courtPriceCents: Math.round(Number(raw.courtPriceCents) * 100), ratePerStudentCents: Math.round(Number(raw.ratePerStudentCents) * 100) });
  const expected = result.success && (result.data.type === "individual" ? studentIds.length === 1 : result.data.type === "pair" ? studentIds.length === 2 : [3, 4].includes(studentIds.length));
  if (!result.success || !expected) redirect("/classes/series/new?error=invalid");
  if (studentIds.length !== new Set(studentIds).size) redirect("/classes/series/new?error=invalid");
  const validStudents = await db.select({ id: students.id }).from(students).where(inArray(students.id, studentIds));
  if (validStudents.length !== new Set(studentIds).size) redirect("/classes/series/new?error=invalid");
  const startsOn = startOfDay(new Date(result.data.startsOn));
  if (Number.isNaN(startsOn.getTime())) redirect("/classes/series/new?error=invalid");
  const firstDate = new Date(startsOn); firstDate.setDate(firstDate.getDate() + (result.data.weekday - firstDate.getDay() + 7) % 7);
  await db.transaction(async (tx) => {
    const [series] = await tx.insert(classSeries).values({ type: result.data.type, weekday: result.data.weekday, timeOfDay: result.data.timeOfDay, durationMin: result.data.durationMin, courtPriceCents: result.data.courtPriceCents, ratePerStudentCents: result.data.ratePerStudentCents, startsOn: result.data.startsOn }).returning({ id: classSeries.id });
    for (let index = 0; index < result.data.weeks; index++) {
      const date = addWeeks(firstDate, index);
      const [created] = await tx.insert(classes).values({ seriesId: series.id, type: result.data.type, startsAt: new Date(`${date.toISOString().slice(0, 10)}T${result.data.timeOfDay}:00`), durationMin: result.data.durationMin, courtPriceCents: result.data.courtPriceCents, ratePerStudentCents: result.data.ratePerStudentCents }).returning({ id: classes.id });
      await tx.insert(classStudents).values(studentIds.map((studentId) => ({ classId: created.id, studentId })));
    }
  });
  revalidatePath("/"); revalidatePath("/calendar"); redirect("/calendar");
}
