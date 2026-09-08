import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings, students } from "@/lib/db/schema";
import { createClass } from "../actions";
import { BackLink } from "@/components/ui/back-link";
import { Input, Select, Textarea, Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";

export const dynamic = "force-dynamic";

export default async function NewClassPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, [settings], studentRows] = await Promise.all([searchParams, db.select().from(appSettings).where(eq(appSettings.id, 1)), db.select().from(students).where(eq(students.active, true))]);
  const current = settings ?? { defaultCourtPriceCents: 2000, rateIndividualCents: 1800, defaultDurationMin: 60 };
  return (
    <main className="mx-auto min-h-screen max-w-3xl pb-12">
      <BackLink href="/calendar" label="Volver al calendario" />
      <h1 className="mt-6 text-3xl font-black">Nueva clase</h1>
      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">El tipo de clase debe coincidir con el número de alumnos.</p>}
      <form action={createClass} className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2">
        <Field label="Tipo"><Select name="type" defaultValue="individual"><option value="individual">Individual · 1 alumno</option><option value="pair">Pareja · 2 alumnos</option><option value="group">Grupo · 3 o 4 alumnos</option></Select></Field>
        <Field label="Fecha y hora"><Input name="startsAt" type="datetime-local" required /></Field>
        <div className="lg:col-span-2"><p className="text-sm font-bold">Alumnos</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{studentRows.map((student) => <label key={student.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm"><input name="studentIds" value={student.id} type="checkbox" className="h-5 w-5 accent-emerald-800" />{student.firstName} {student.lastName}</label>)}</div></div>
        <Field label="Precio pista"><MoneyInput name="courtPriceCents" defaultValue={(current.defaultCourtPriceCents / 100).toFixed(2)} /></Field>
        <Field label="Precio clase / alumno"><MoneyInput name="ratePerStudentCents" defaultValue={(current.rateIndividualCents / 100).toFixed(2)} /></Field>
        <Field label="Duración"><Input name="durationMin" type="number" min="1" defaultValue={current.defaultDurationMin} /></Field>
        <Field label="Comentario"><Textarea name="notes" /></Field>
        <button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">Guardar clase</button>
      </form>
    </main>
  );
}
