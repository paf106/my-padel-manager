"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { classStudents, students } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const studentSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  lastName: z.string().trim().min(1, "Los apellidos son obligatorios").max(120),
  birthDate: z.string().optional(),
  level: z.enum(["intro", "beginner", "intermediate", "advanced", "competition"]),
  gender: z.enum(["male", "female"]),
  phone: z.string().trim().max(30).optional(),
});

export type CreateStudentState = { ok: true } | { error: string };

export async function createStudent(
  _previousState: CreateStudentState,
  formData: FormData,
): Promise<CreateStudentState> {
  await requireUser();
  const result = studentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Revisa los datos introducidos." };

  await db.insert(students).values({
    ...result.data,
    birthDate: result.data.birthDate || null,
    phone: result.data.phone || null,
  });
  revalidatePath("/students");
  revalidateTag("active-students", "max");
  return { ok: true };
}

export async function updateStudent(id: string, formData: FormData) {
  await requireUser();
  const result = studentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(`/students/${id}/edit?error=invalid`);

  await db
    .update(students)
    .set({
      ...result.data,
      birthDate: result.data.birthDate || null,
      phone: result.data.phone || null,
      updatedAt: new Date(),
    })
    .where(eq(students.id, id));
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  revalidateTag("active-students", "max");
  redirect(`/students/${id}`);
}

export async function deleteStudent(id: string) {
  await requireUser();
  const deleted = await db
    .delete(students)
    .where(
      and(
        eq(students.id, id),
        sql`not exists (select 1 from ${classStudents} where ${classStudents.studentId} = ${id})`,
      ),
    )
    .returning({ id: students.id });
  if (deleted.length === 0) redirect(`/students/${id}?error=has-classes`);
  revalidatePath("/students");
  revalidateTag("active-students", "max");
  redirect("/students");
}
