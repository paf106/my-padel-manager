"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function updateSettings(formData: FormData) {
  await requireUser();
  const value = (name: string) => Math.round(Number(formData.get(name)) * 100);
  const prices = {
    defaultCourtPriceCents: value("defaultCourtPriceCents"),
    rateIndividualCents: value("rateIndividualCents"),
    ratePairCents: value("ratePairCents"),
    rateGroupCents: value("rateGroupCents"),
    defaultDurationMin: Number(formData.get("defaultDurationMin")),
  };
  if (Object.values(prices).some((item) => !Number.isInteger(item) || item < 0)) return;
  await db.insert(appSettings).values({ id: 1, ...prices }).onConflictDoUpdate({ target: appSettings.id, set: prices });
  revalidatePath("/settings");
  revalidatePath("/classes/new");
  revalidateTag("app-settings", "max");
}
