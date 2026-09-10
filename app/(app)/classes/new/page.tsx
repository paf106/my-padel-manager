import { getCachedActiveStudents, getCachedAppSettings } from "@/lib/cached-data";
import { createClass } from "../actions";
import { Input, Textarea, Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { StudentPicker } from "@/components/classes/student-picker";
import { ClassTypeAndRateFields } from "@/components/classes/class-type-and-rate-fields";

export default async function NewClassPage({ searchParams }: { searchParams: Promise<{ error?: string; date?: string }> }) {
  const [{ error, date }, current, studentRows] = await Promise.all([searchParams, getCachedAppSettings(), getCachedActiveStudents()]);
  const prefill = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? `${date}T18:00` : undefined;
  return (
    <main className="mx-auto max-w-3xl">
      <PageHeader title="Nueva clase" eyebrow="Clases" backHref="/calendar" />
      {error && <Alert>El tipo de clase debe coincidir con el número de alumnos.</Alert>}
      <form action={createClass} className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2">
        <ClassTypeAndRateFields rates={{ individual: current.rateIndividualCents, pair: current.ratePairCents, group: current.rateGroupCents }} />
        <Field label="Fecha y hora"><Input name="startsAt" type="datetime-local" required defaultValue={prefill} /></Field>
        <StudentPicker students={studentRows} />
        <Field label="Precio pista"><MoneyInput name="courtPriceCents" defaultValue={(current.defaultCourtPriceCents / 100).toFixed(2)} /></Field>
        <Field label="Duración"><Input name="durationMin" type="number" min="1" defaultValue={current.defaultDurationMin} /></Field>
        <Field label="Comentario"><Textarea name="notes" /></Field>
        <button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">Guardar clase</button>
      </form>
    </main>
  );
}
