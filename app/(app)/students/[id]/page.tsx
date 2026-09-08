import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { levelLabels, genderLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [student] = await db.select().from(students).where(eq(students.id, id));
  if (!student) return <main className="mx-auto max-w-2xl px-5 pt-8">Alumno no encontrado.</main>;
  return <main className="mx-auto min-h-screen max-w-3xl pb-12"><Link href="/students" className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-bold text-slate-600 hover:bg-slate-200">← Volver a alumnos</Link><div className="mt-6 flex items-start justify-between"><div><h1 className="text-3xl font-black">{student.firstName} {student.lastName}</h1><p className="mt-2 text-slate-500">{student.phone || "Sin teléfono"}</p></div><Link href={`/students/${id}/edit`} className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Editar</Link></div><dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5"><Info label="Nivel" value={levelLabels[student.level]} /><Info label="Sexo" value={genderLabels[student.gender]} /><Info label="Fecha de nacimiento" value={student.birthDate || "No indicada"} /><Info label="Estado" value={student.active ? "Activo" : "Inactivo"} /></dl></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-4 text-sm"><dt className="font-bold text-slate-500">{label}</dt><dd className="text-right font-bold">{value}</dd></div>; }
