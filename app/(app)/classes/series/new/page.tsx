import { getCachedActiveStudents, getCachedAppSettings } from "@/lib/cached-data";
import { createSeries } from "../actions";
import { Input, Select, Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { PageHeader } from "@/components/ui/page-header";
import { StudentPicker } from "@/components/classes/student-picker";
import { ClassTypeAndRateFields } from "@/components/classes/class-type-and-rate-fields";

export default async function NewSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, current, studentRows] = await Promise.all([
    searchParams,
    getCachedAppSettings(),
    getCachedActiveStudents(),
  ]);
  return (
    <main className="mx-auto max-w-3xl">
      <PageHeader
        title="Serie semanal"
        eyebrow="Clases"
        subtitle="Genera varias clases de una vez."
        backHref="/calendar"
      />
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          Revisa el tipo y el número de alumnos.
        </p>
      )}
      <form
        action={createSeries}
        className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2"
      >
        <ClassTypeAndRateFields
          rates={{
            individual: current.rateIndividualCents,
            pair: current.ratePairCents,
            group: current.rateGroupCents,
          }}
        />
        <Field label="Día">
          <Select name="weekday" defaultValue="1">
            <option value="1">Lunes</option>
            <option value="2">Martes</option>
            <option value="3">Miércoles</option>
            <option value="4">Jueves</option>
            <option value="5">Viernes</option>
            <option value="6">Sábado</option>
            <option value="0">Domingo</option>
          </Select>
        </Field>
        <Field label="Primera fecha">
          <Input name="startsOn" type="date" required />
        </Field>
        <Field label="Hora">
          <Input name="timeOfDay" type="time" required defaultValue="18:00" />
        </Field>
        <Field label="Número de semanas">
          <Input name="weeks" type="number" min="1" max="52" defaultValue="4" />
        </Field>
        <StudentPicker students={studentRows} />
        <Field label="Precio pista">
          <MoneyInput
            name="courtPriceCents"
            defaultValue={(current.defaultCourtPriceCents / 100).toFixed(2)}
          />
        </Field>
        <button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">
          Crear serie
        </button>
      </form>
    </main>
  );
}
