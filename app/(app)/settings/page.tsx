import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { updateSettings } from "./actions";
import { PageHeader } from "@/components/ui/page-header";
import { Field, Input } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, 1));
  const current = settings ?? { defaultCourtPriceCents: 2000, rateIndividualCents: 1800, ratePairCents: 1200, rateGroupCents: 1000, defaultDurationMin: 60 };
  return <main className="mx-auto min-h-screen max-w-3xl pb-12"><PageHeader title="Ajustes" eyebrow="Configuración" /><p className="mt-2 text-slate-500">Estos precios se usarán como valor inicial en las nuevas clases.</p><form action={updateSettings} className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2"><Field label="Precio habitual de pista"><MoneyInput name="defaultCourtPriceCents" defaultValue={(current.defaultCourtPriceCents / 100).toFixed(2)} /></Field><Field label="Clase individual"><MoneyInput name="rateIndividualCents" defaultValue={(current.rateIndividualCents / 100).toFixed(2)} /></Field><Field label="Clase pareja · por alumno"><MoneyInput name="ratePairCents" defaultValue={(current.ratePairCents / 100).toFixed(2)} /></Field><Field label="Clase grupo · por alumno"><MoneyInput name="rateGroupCents" defaultValue={(current.rateGroupCents / 100).toFixed(2)} /></Field><Field label="Duración por defecto (minutos)"><Input name="defaultDurationMin" type="number" min="1" step="1" defaultValue={current.defaultDurationMin} /></Field><button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">Guardar ajustes</button></form></main>;
}
