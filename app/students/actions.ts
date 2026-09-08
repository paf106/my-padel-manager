"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";

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
