import { eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { classStudents, classes, paymentLines, students } from "@/lib/db/schema";
import { updateClass } from "../actions";
import { Input, Select, Textarea, Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { PageHeader } from "@/components/ui/page-header";
import { StudentPicker } from "@/components/classes/student-picker";
import { madridLocalInputValue } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [[item], selectedRows, paymentRows] = await Promise.all([db.select().from(classes).where(eq(classes.id, id)), db.select({ studentId: classStudents.studentId }).from(classStudents).where(eq(classStudents.classId, id)), db.select({ paymentId: paymentLines.paymentId }).from(paymentLines).where(eq(paymentLines.classId, id)).limit(1)]);
  if (!item) return <main className="mx-auto max-w-3xl"><PageHeader title="Clase no encontrada" eyebrow="Clases" backHref="/calendar" /></main>;
  const selected = new Set(selectedRows.map((row) => row.studentId));
  const studentRows = await db.select({ id: students.id, firstName: students.firstName, lastName: students.lastName, active: students.active }).from(students).where(or(eq(students.active, true), inArray(students.id, [...selected])));
  const localDateTime = madridLocalInputValue(item.startsAt);
  return <main className="mx-auto max-w-3xl"><PageHeader title="Editar clase" eyebrow="Clases" backHref={`/classes/${id}`} />{error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">El tipo debe coincidir con el número de alumnos.</p>}{paymentRows.length > 0 && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Esta clase ya está incluida en un pago generado. Si cambias su estado o sus precios, vuelve a pulsar &quot;Generar pagos&quot; en el mes correspondiente.</p>}<form action={updateClass.bind(null, id)} className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2"><Field label="Tipo"><Select name="type" defaultValue={item.type}><option value="individual">Individual · 1 alumno</option><option value="pair">Pareja · 2 alumnos</option><option value="group">Grupo · 3 o 4 alumnos</option></Select></Field><Field label="Estado"><Select name="status" defaultValue={item.status}><option value="pending">Pendiente</option><option value="completed">Terminada</option><option value="cancelled">Cancelada</option></Select></Field><Field label="Fecha y hora"><Input name="startsAt" type="datetime-local" required defaultValue={localDateTime} /></Field><StudentPicker students={studentRows} selectedIds={[...selected]} /><Field label="Precio pista"><MoneyInput name="courtPriceCents" defaultValue={(item.courtPriceCents / 100).toFixed(2)} /></Field><Field label="Precio clase / alumno"><MoneyInput name="ratePerStudentCents" defaultValue={(item.ratePerStudentCents / 100).toFixed(2)} /></Field><Field label="Duración"><Input name="durationMin" type="number" min="1" defaultValue={item.durationMin} /></Field><Field label="Comentario"><Textarea name="notes" defaultValue={item.notes ?? ""} /></Field><button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white lg:col-span-2 lg:w-fit lg:px-6">Guardar cambios</button></form></main>;
}
