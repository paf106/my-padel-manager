"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";

export async function updatePayment(id: string, formData: FormData) {
  await requireUser();
  const amount = Math.round(Number(formData.get("paidAmount")) * 100);
  const overrideRaw = String(formData.get("overrideAmount") ?? "").trim();
  const overrideAmount = overrideRaw ? Math.round(Number(overrideRaw) * 100) : null;
  const overrideReason = String(formData.get("overrideReason") ?? "").trim().slice(0, 500) || null;
  const method = String(formData.get("method") ?? "");
  if (!Number.isFinite(amount) || amount < 0 || (overrideAmount !== null && (!Number.isFinite(overrideAmount) || overrideAmount < 0)) || !["cash", "bizum", "transfer"].includes(method)) return;
  await db.update(payments).set({ paidAmountCents: amount, overrideAmountCents: overrideAmount, overrideReason, method: method as "cash" | "bizum" | "transfer", paidAt: amount > 0 ? new Date() : null, updatedAt: new Date() }).where(eq(payments.id, id));
  revalidatePath("/payments"); revalidatePath(`/payments/${id}`);
}
