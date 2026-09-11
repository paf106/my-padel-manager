import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { updateStudent } from "../../actions";
import { BackLink } from "@/components/ui/back-link";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { StudentFormFields } from "@/components/students/student-form-fields";

export const dynamic = "force-dynamic";

export default async function EditStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [student] = await db.select().from(students).where(eq(students.id, id));
  if (!student)
    return (
      <main className="mx-auto max-w-3xl">
        <BackLink href="/students" label="Volver a alumnos" />
        <p className="mt-6">Alumno no encontrado.</p>
      </main>
    );
  return (
    <main className="mx-auto max-w-3xl">
      <PageHeader title="Editar alumno" eyebrow="Alumnos" backHref={`/students/${id}`} />
      {error && <Alert>Revisa los datos introducidos.</Alert>}
      <form
        action={updateStudent.bind(null, id)}
        className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2"
      >
        <StudentFormFields student={student} />
        <button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
