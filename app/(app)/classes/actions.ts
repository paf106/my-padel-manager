"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { classStudents, classes } from "@/lib/db/schema";

const typeValues = ["individual", "pair", "group"] as const;
const statusValues = ["pending", "cancelled", "completed"] as const;

const classSchema = z.object({
  type: z.enum(typeValues),
  status: z.enum(statusValues),
  startsAt: z
    .string()
    .trim()
    .min(1, "La fecha y hora son obligatorias")
    .transform((v) => new Date(v))
    .refine((d) => !Number.isNaN(d.getTime()), "Fecha no válida"),
  durationMin: z.coerce.number().int().min(0).max(600).default(60),
  courtPrice: z.coerce.number().min(0).max(100000).default(0),
  classPrice: z.coerce.number().min(0).max(100000).default(0),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : null)),
  studentIds: z.array(z.string().uuid()).default([]),
});

export type ClassFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return classSchema.safeParse({
    type: formData.get("type"),
    status: formData.get("status"),
    startsAt: formData.get("startsAt"),
    durationMin: formData.get("durationMin"),
    courtPrice: formData.get("courtPrice"),
    classPrice: formData.get("classPrice"),
    notes: formData.get("notes") ?? "",
    studentIds: formData.getAll("studentIds").map(String),
  });
}

export async function createClass(
  _prev: ClassFormState,
  formData: FormData
): Promise<ClassFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { studentIds, courtPrice, classPrice, ...rest } = parsed.data;

  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(classes)
      .values({
        ...rest,
        courtPrice: courtPrice.toFixed(2),
        classPrice: classPrice.toFixed(2),
      })
      .returning({ id: classes.id });

    if (studentIds.length) {
      await tx.insert(classStudents).values(
        studentIds.map((studentId) => ({ classId: row.id, studentId }))
      );
    }
  });

  revalidatePath("/classes");
  revalidatePath("/calendar");
  return { ok: true };
}

export async function updateClass(
  id: string,
  _prev: ClassFormState,
  formData: FormData
): Promise<ClassFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { studentIds, courtPrice, classPrice, ...rest } = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(classes)
      .set({
        ...rest,
        courtPrice: courtPrice.toFixed(2),
        classPrice: classPrice.toFixed(2),
      })
      .where(eq(classes.id, id));

    // Replace the set of students for the class.
    await tx.delete(classStudents).where(eq(classStudents.classId, id));
    if (studentIds.length) {
      await tx.insert(classStudents).values(
        studentIds.map((studentId) => ({ classId: id, studentId }))
      );
    }
  });

  revalidatePath("/classes");
  revalidatePath(`/classes/${id}`);
  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteClass(id: string) {
  await db.delete(classes).where(eq(classes.id, id));
  revalidatePath("/classes");
  revalidatePath("/calendar");
  redirect("/classes");
}
