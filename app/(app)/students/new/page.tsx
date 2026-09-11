import { createStudent } from "../actions";
import { PageHeader } from "@/components/ui/page-header";
import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <PageHeader title="Nuevo alumno" eyebrow="Alumnos" backHref="/students" />
      <div className="mt-8">
        <StudentForm action={createStudent} submitLabel="Guardar alumno" successHref="/students" />
      </div>
    </main>
  );
}
