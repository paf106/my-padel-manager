import Link from "next/link";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { classStudents, classes, students } from "@/lib/db/schema";
import { classStatusLabels, classTypeLabels } from "@/lib/labels";
import { formatMoney } from "@/lib/format";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteClass } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item] = await db.select().from(classes).where(eq(classes.id, id));
  if (!item) return <main className="mx-auto max-w-5xl"><BackLink href="/calendar" label="Volver al calendario" /><p className="mt-6">Clase no encontrada.</p></main>;
  const classmates = await db.select({ student: students }).from(classStudents).innerJoin(students, eq(classStudents.studentId, students.id)).where(eq(classStudents.classId, id));
  return <main className="mx-auto min-h-screen max-w-5xl pb-12"><div className="flex items-start justify-between"><BackLink href="/calendar" label="Volver al calendario" /><div className="flex gap-2"><Link href={`/classes/${id}/edit`} className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Editar</Link><ConfirmButton label="Eliminar clase" confirmLabel="La clase se eliminará definitivamente."><form action={deleteClass.bind(null, id)}><button className="min-h-11 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white">Eliminar</button></form></ConfirmButton></div></div><h1 className="mt-6 text-3xl font-black">{format(item.startsAt, "d/MM · HH:mm")}</h1><div className="mt-2 flex items-center gap-3"><p className="text-slate-500">{classTypeLabels[item.type]} · {item.durationMin} min</p><Badge tone={item.status === "completed" ? "success" : item.status === "cancelled" ? "danger" : "warning"}>{classStatusLabels[item.status]}</Badge></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Resumen económico</p><dl className="mt-3 divide-y divide-slate-100"><Info label="Precio de clase" value={formatMoney(item.ratePerStudentCents)} /><Info label="Precio de pista" value={formatMoney(item.courtPriceCents)} /></dl><h2 className="mt-6 text-sm font-bold text-slate-500">Alumnos</h2><div className="mt-3 space-y-2">{classmates.map(({ student }) => <p key={student.id} className="font-bold">{student.firstName} {student.lastName}</p>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Comentario</p><p className="mt-3 whitespace-pre-wrap text-sm">{item.notes || <span className="text-slate-400">Sin comentario</span>}</p></section></div></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-bold">{value}</dd></div>; }
