import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classStudents, classes, students } from "@/lib/db/schema";
import { updateClass } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [[item], studentRows, selectedRows] = await Promise.all([
    db.select().from(classes).where(eq(classes.id, id)),
    db.select().from(students).where(eq(students.active, true)),
    db.select({ studentId: classStudents.studentId }).from(classStudents).where(eq(classStudents.classId, id)),
  ]);
  if (!item) return <main className="mx-auto max-w-2xl px-5 pt-8">Clase no encontrada.</main>;
  const selected = new Set(selectedRows.map((row) => row.studentId));
  const localDateTime = new Date(item.startsAt.getTime() - item.startsAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return <main className="mx-auto min-h-screen max-w-2xl px-5 pb-12 pt-8"><Link href={`/classes/${id}`} className="text-sm font-bold text-emerald-700">← Volver a la clase</Link><h1 className="mt-6 text-3xl font-black">Editar clase</h1>{error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">El tipo debe coincidir con el número de alumnos.</p>}<form action={updateClass.bind(null, id)} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5"><label className="block text-sm font-bold">Tipo<select name="type" defaultValue={item.type} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3"><option value="individual">Individual · 1 alumno</option><option value="pair">Pareja · 2 alumnos</option><option value="group">Grupo · 3 o 4 alumnos</option></select></label><label className="block text-sm font-bold">Fecha y hora<input name="startsAt" type="datetime-local" required defaultValue={localDateTime} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3" /></label><div><p className="text-sm font-bold">Alumnos</p><div className="mt-2 space-y-2">{studentRows.map((student) => <label key={student.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm"><input name="studentIds" value={student.id} defaultChecked={selected.has(student.id)} type="checkbox" className="h-5 w-5 accent-emerald-800" />{student.firstName} {student.lastName}</label>)}</div></div><div className="grid gap-5 sm:grid-cols-2"><MoneyField name="courtPriceCents" label="Precio pista" value={item.courtPriceCents} /><MoneyField name="ratePerStudentCents" label="Precio clase / alumno" value={item.ratePerStudentCents} /></div><label className="block text-sm font-bold">Duración<input name="durationMin" type="number" min="1" defaultValue={item.durationMin} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3" /></label><label className="block text-sm font-bold">Comentario<textarea name="notes" defaultValue={item.notes ?? ""} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 p-3" /></label><button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white">Guardar cambios</button></form></main>;
}

function MoneyField({ name, label, value }: { name: string; label: string; value: number }) { return <label className="block text-sm font-bold">{label}<input name={name} type="number" min="0" step="0.01" inputMode="decimal" defaultValue={(value / 100).toFixed(2)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3" /></label>; }
