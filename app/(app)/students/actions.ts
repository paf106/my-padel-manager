"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";

const levelValues = ["beginner_intro", "beginner", "intermediate", "advanced"] as const;
const genderValues = ["male", "female", "other"] as const;

const studentSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  lastName: z.string().trim().max(120).optional().default(""),
  birthDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  level: z.enum(levelValues),
  gender: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.enum(genderValues).nullable()),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type StudentFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return studentSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    level: formData.get("level"),
    gender: formData.get("gender") ?? "",
    phone: formData.get("phone") ?? "",
  });
}

export async function createStudent(
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  await db.insert(students).values(parsed.data);
  revalidatePath("/students");
  return { ok: true };
}

export async function updateStudent(
  id: string,
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  await db.update(students).set(parsed.data).where(eq(students.id, id));
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  return { ok: true };
}

export async function deleteStudent(id: string) {
  await db.delete(students).where(eq(students.id, id));
  revalidatePath("/students");
  redirect("/students");
}
