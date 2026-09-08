"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";

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
