"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const studentSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  lastName: z.string().trim().min(1, "Los apellidos son obligatorios").max(120),
  birthDate: z.string().optional(),
  level: z.enum(["intro", "beginner", "intermediate", "advanced", "competition"]),
  gender: z.enum(["male", "female"]),
  phone: z.string().trim().max(30).optional(),
});

export async function createStudent(formData: FormData) {
  const result = studentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect("/students/new?error=invalid");

  await db.insert(students).values({
    ...result.data,
    birthDate: result.data.birthDate || null,
    phone: result.data.phone || null,
  });
  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudent(id: string, formData: FormData) {
  const result = studentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(`/students/${id}/edit?error=invalid`);

  await db.update(students).set({
    ...result.data,
    birthDate: result.data.birthDate || null,
    phone: result.data.phone || null,
    updatedAt: new Date(),
  }).where(eq(students.id, id));
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  redirect(`/students/${id}`);
}
