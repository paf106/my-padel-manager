import Link from "next/link";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { classStudents, classes, students } from "@/lib/db/schema";
import { classStatusLabels, classTypeLabels } from "@/lib/labels";
import { formatMoney } from "@/lib/format";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { deleteClass, updateClassNotes, updateClassStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item] = await db.select().from(classes).where(eq(classes.id, id));
  if (!item) return <main className="mx-auto max-w-5xl"><BackLink href="/calendar" label="Volver al calendario" /><p className="mt-6">Clase no encontrada.</p></main>;
  const classmates = await db.select({ student: students }).from(classStudents).innerJoin(students, eq(classStudents.studentId, students.id)).where(eq(classStudents.classId, id));
  return <main className="mx-auto min-h-screen max-w-5xl pb-12"><div className="flex items-start justify-between"><BackLink href="/calendar" label="Volver al calendario" /><Link href={`/classes/${id}/edit`} className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Editar</Link></div><h1 className="mt-6 text-3xl font-black">{format(item.startsAt, "d/MM · HH:mm")}</h1><p className="mt-2 text-slate-500">{classTypeLabels[item.type]} · {item.durationMin} min</p><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Resumen económico</p><dl className="mt-3 divide-y divide-slate-100"><Info label="Precio de clase" value={formatMoney(item.ratePerStudentCents)} /><Info label="Precio de pista" value={formatMoney(item.courtPriceCents)} /></dl><h2 className="mt-6 text-sm font-bold text-slate-500">Alumnos</h2><div className="mt-3 space-y-2">{classmates.map(({ student }) => <p key={student.id} className="font-bold">{student.firstName} {student.lastName}</p>)}</div></section><div><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Estado</p><div className="mt-3 flex flex-wrap items-center gap-2"><Badge tone={item.status === "completed" ? "success" : item.status === "cancelled" ? "danger" : "warning"}>{classStatusLabels[item.status]}</Badge>{(["pending", "completed", "cancelled"] as const).map((status) => <form key={status} action={updateClassStatus.bind(null, id, status)}><button className="min-h-10 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-600">{classStatusLabels[status]}</button></form>)}</div></section><form action={updateClassNotes.bind(null, id)} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><label className="block text-sm font-bold">Comentario de la clase<textarea name="notes" defaultValue={item.notes ?? ""} maxLength={1000} className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 p-3" /></label><button className="mt-4 min-h-11 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white">Guardar comentario</button></form><form action={deleteClass.bind(null, id)} className="mt-5"><button className="text-sm font-bold text-red-700">Eliminar clase</button></form></div></div></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-bold">{value}</dd></div>; }
