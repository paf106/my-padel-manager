import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { updateSettings } from "./actions";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, 1));
  const current = settings ?? { defaultCourtPriceCents: 2000, rateIndividualCents: 1800, ratePairCents: 1200, rateGroupCents: 1000, defaultDurationMin: 60 };
  return <main className="mx-auto min-h-screen max-w-3xl pb-12"><PageHeader title="Ajustes" eyebrow="Configuración" backHref="/" /><p className="mt-2 text-slate-500">Estos precios se usarán como valor inicial en las nuevas clases.</p><form action={updateSettings} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0"><MoneyField name="defaultCourtPriceCents" label="Precio habitual de pista" value={current.defaultCourtPriceCents} /><MoneyField name="rateIndividualCents" label="Clase individual" value={current.rateIndividualCents} /><MoneyField name="ratePairCents" label="Clase pareja · por alumno" value={current.ratePairCents} /><MoneyField name="rateGroupCents" label="Clase grupo · por alumno" value={current.rateGroupCents} /><label className="block text-sm font-bold">Duración por defecto (minutos)<input name="defaultDurationMin" type="number" min="1" step="1" defaultValue={current.defaultDurationMin} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3" /></label><button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">Guardar ajustes</button></form></main>;
}

function MoneyField({ name, label, value }: { name: string; label: string; value: number }) { return <label className="block text-sm font-bold">{label}<div className="relative mt-2"><input name={name} type="number" min="0" step="0.01" inputMode="decimal" defaultValue={(value / 100).toFixed(2)} className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 pr-10" /><span className="pointer-events-none absolute right-3 top-3 text-slate-400">€</span></div></label>; }
