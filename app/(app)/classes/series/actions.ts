"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { classSeries, classStudents, classes, students } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { madridFromLocalInput, madridSeriesDateKeys } from "@/lib/dates";

const seriesSchema = z.object({
  type: z.enum(["individual", "pair", "group"]), weekday: z.coerce.number().int().min(0).max(6), timeOfDay: z.string().regex(/^\d{2}:\d{2}$/), startsOn: z.string().min(1), weeks: z.coerce.number().int().min(1).max(52), durationMin: z.coerce.number().int().positive(), courtPriceCents: z.coerce.number().int().nonnegative(), ratePerStudentCents: z.coerce.number().int().nonnegative(),
});

export async function createSeries(formData: FormData) {
  await requireUser();
  const studentIds = formData.getAll("studentIds").map(String);
  const raw = Object.fromEntries(formData);
  const result = seriesSchema.safeParse({ ...raw, weekday: Number(raw.weekday), weeks: Number(raw.weeks), durationMin: Number(raw.durationMin), courtPriceCents: Math.round(Number(raw.courtPriceCents) * 100), ratePerStudentCents: Math.round(Number(raw.ratePerStudentCents) * 100) });
  const expected = result.success && (result.data.type === "individual" ? studentIds.length === 1 : result.data.type === "pair" ? studentIds.length === 2 : [3, 4].includes(studentIds.length));
  if (!result.success || !expected) redirect("/classes/series/new?error=invalid");
  if (studentIds.length !== new Set(studentIds).size) redirect("/classes/series/new?error=invalid");
  const validStudents = await db.select({ id: students.id }).from(students).where(inArray(students.id, studentIds));
  if (validStudents.length !== new Set(studentIds).size) redirect("/classes/series/new?error=invalid");
  const dateKeys = madridSeriesDateKeys(result.data.startsOn, result.data.weekday, result.data.weeks);
  await db.transaction(async (tx) => {
    const [series] = await tx.insert(classSeries).values({ type: result.data.type, weekday: result.data.weekday, timeOfDay: result.data.timeOfDay, durationMin: result.data.durationMin, courtPriceCents: result.data.courtPriceCents, ratePerStudentCents: result.data.ratePerStudentCents, startsOn: result.data.startsOn }).returning({ id: classSeries.id });
    const created = await tx.insert(classes).values(dateKeys.map((dateKey) => ({ seriesId: series.id, type: result.data.type, startsAt: madridFromLocalInput(`${dateKey}T${result.data.timeOfDay}`), durationMin: result.data.durationMin, courtPriceCents: result.data.courtPriceCents, ratePerStudentCents: result.data.ratePerStudentCents }))).returning({ id: classes.id });
    await tx.insert(classStudents).values(created.flatMap(({ id }) => studentIds.map((studentId) => ({ classId: id, studentId }))));
  });
  revalidatePath("/"); revalidatePath("/calendar"); redirect("/calendar");
}
