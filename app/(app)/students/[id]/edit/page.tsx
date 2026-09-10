import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { updateStudent } from "../../actions";
import { BackLink } from "@/components/ui/back-link";
import { Input, Select, Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function EditStudentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [student] = await db.select().from(students).where(eq(students.id, id));
  if (!student) return <main className="mx-auto max-w-3xl"><BackLink href="/students" label="Volver a alumnos" /><p className="mt-6">Alumno no encontrado.</p></main>;
  return (
    <main className="mx-auto min-h-screen max-w-3xl pb-12">
      <BackLink href={`/students/${id}`} label="Volver al alumno" />
      <h1 className="mt-6 text-3xl font-black">Editar alumno</h1>
      {error && <Alert>Revisa los datos introducidos.</Alert>}
      <form action={updateStudent.bind(null, id)} className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2">
        <Field label="Nombre"><Input name="firstName" required maxLength={80} defaultValue={student.firstName} /></Field>
        <Field label="Apellidos"><Input name="lastName" required maxLength={120} defaultValue={student.lastName} /></Field>
        <Field label="Fecha de nacimiento"><Input name="birthDate" type="date" defaultValue={student.birthDate || ""} /></Field>
        <Field label="Nivel"><Select name="level" defaultValue={student.level}><option value="intro">Iniciación</option><option value="beginner">Principiante</option><option value="intermediate">Medio</option><option value="advanced">Avanzado</option><option value="competition">Competición</option></Select></Field>
        <Field label="Sexo"><Select name="gender" defaultValue={student.gender}><option value="male">Hombre</option><option value="female">Mujer</option></Select></Field>
        <Field label="Teléfono"><Input name="phone" type="tel" defaultValue={student.phone || ""} /></Field>
        <button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">Guardar cambios</button>
      </form>
    </main>
  );
}
