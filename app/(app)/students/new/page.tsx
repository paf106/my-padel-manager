import { createStudent } from "../actions";
import { Input, Select, Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewStudentPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-3xl">
      <PageHeader title="Nuevo alumno" eyebrow="Alumnos" backHref="/students" />
      {error && <Alert>Revisa los datos introducidos.</Alert>}
      <form action={createStudent} className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2">
        <Field label="Nombre"><Input name="firstName" required maxLength={80} /></Field>
        <Field label="Apellidos"><Input name="lastName" required maxLength={120} /></Field>
        <Field label="Fecha de nacimiento"><Input name="birthDate" type="date" /></Field>
        <Field label="Nivel"><Select name="level" defaultValue="intro"><option value="intro">Iniciación</option><option value="beginner">Principiante</option><option value="intermediate">Medio</option><option value="advanced">Avanzado</option><option value="competition">Competición</option></Select></Field>
        <Field label="Sexo"><Select name="gender" defaultValue="male"><option value="male">Hombre</option><option value="female">Mujer</option></Select></Field>
        <Field label="Teléfono"><Input name="phone" type="tel" autoComplete="tel" /></Field>
        <button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">Guardar alumno</button>
      </form>
    </main>
  );
}
