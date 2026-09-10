import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { appSettings, students } from "@/lib/db/schema";

export const getCachedAppSettings = unstable_cache(async () => {
  const [settings] = await db.select({ defaultCourtPriceCents: appSettings.defaultCourtPriceCents, rateIndividualCents: appSettings.rateIndividualCents, ratePairCents: appSettings.ratePairCents, rateGroupCents: appSettings.rateGroupCents, defaultDurationMin: appSettings.defaultDurationMin }).from(appSettings).where(eq(appSettings.id, 1));
  return settings ?? { defaultCourtPriceCents: 2000, rateIndividualCents: 1800, ratePairCents: 1200, rateGroupCents: 1000, defaultDurationMin: 60 };
}, ["app-settings"], { tags: ["app-settings"], revalidate: 3600 });

export const getCachedActiveStudents = unstable_cache(async () => db.select({ id: students.id, firstName: students.firstName, lastName: students.lastName, active: students.active }).from(students).where(eq(students.active, true)), ["active-students"], { tags: ["active-students"], revalidate: 300 });
