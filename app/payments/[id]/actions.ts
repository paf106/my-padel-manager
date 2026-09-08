"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";

export async function updatePayment(id: string, formData: FormData) {
  const amount = Math.round(Number(formData.get("paidAmount")) * 100);
  const method = String(formData.get("method") ?? "");
  if (!Number.isFinite(amount) || amount < 0 || !["cash", "bizum", "transfer"].includes(method)) return;
  await db.update(payments).set({ paidAmountCents: amount, method: method as "cash" | "bizum" | "transfer", paidAt: amount > 0 ? new Date() : null, updatedAt: new Date() }).where(eq(payments.id, id));
  revalidatePath("/payments"); revalidatePath(`/payments/${id}`);
}
