import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { levelLabels, genderLabels } from "@/lib/labels";
import { BackLink } from "@/components/ui/back-link";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [student] = await db.select().from(students).where(eq(students.id, id));
  if (!student) return <main className="mx-auto max-w-3xl"><BackLink href="/students" label="Volver a alumnos" /><p className="mt-6">Alumno no encontrado.</p></main>;
  return (
    <main className="mx-auto min-h-screen max-w-3xl pb-12">
      <div className="flex items-start justify-between"><BackLink href="/students" label="Volver a alumnos" /><Link href={`/students/${id}/edit`} className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Editar</Link></div>
      <h1 className="mt-6 text-3xl font-black">{student.firstName} {student.lastName}</h1>
      <p className="mt-2 text-slate-500">{student.phone || "Sin teléfono"}</p>
      <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 lg:max-w-2xl">
        <Info label="Nivel" value={levelLabels[student.level]} />
        <Info label="Sexo" value={genderLabels[student.gender]} />
        <Info label="Fecha de nacimiento" value={student.birthDate || "No indicada"} />
        <Info label="Estado" value={student.active ? "Activo" : "Inactivo"} />
      </dl>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-4 text-sm"><dt className="font-bold text-slate-500">{label}</dt><dd className="text-right font-bold">{value}</dd></div>; }
