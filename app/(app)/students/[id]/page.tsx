import Link from "next/link";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { classStudents, classes, students } from "@/lib/db/schema";
import { levelLabels, genderLabels, classStatusLabels, classTypeLabels } from "@/lib/labels";
import { formatMoney } from "@/lib/format";
import { parseCalendarMonth } from "@/lib/calendar";
import { madridMonthRange } from "@/lib/dates";
import { BackLink } from "@/components/ui/back-link";
import { Select } from "@/components/ui/field";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ year?: string; month?: string }> }) {
  const { id } = await params;
  const filter = await searchParams;
  const [student] = await db.select().from(students).where(eq(students.id, id));
  if (!student) return <main className="mx-auto max-w-3xl"><BackLink href="/students" label="Volver a alumnos" /><p className="mt-6">Alumno no encontrado.</p></main>;
  const { year, month } = parseCalendarMonth(filter.year, filter.month);
  const range = madridMonthRange(new Date(Date.UTC(year, month - 1, 15)));
  const lessons = await db.select({ lesson: classes }).from(classStudents).innerJoin(classes, eq(classStudents.classId, classes.id)).where(and(eq(classStudents.studentId, id), gte(classes.startsAt, range.start), lt(classes.startsAt, range.end))).orderBy(classes.startsAt);
  const years = Array.from(new Set(lessons.map(({ lesson }) => lesson.startsAt.getFullYear()).concat(year))).sort((a, b) => b - a);
  return <main className="mx-auto min-h-screen max-w-5xl pb-12"><div className="flex items-start justify-between"><BackLink href="/students" label="Volver a alumnos" /><Link href={`/students/${id}/edit`} className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Editar</Link></div><h1 className="mt-6 text-3xl font-black">{student.firstName} {student.lastName}</h1><p className="mt-2 text-slate-500">{student.phone || "Sin teléfono"}</p><dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 lg:max-w-2xl"><Info label="Nivel" value={levelLabels[student.level]} /><Info label="Sexo" value={genderLabels[student.gender]} /><Info label="Fecha de nacimiento" value={student.birthDate || "No indicada"} /><Info label="Estado" value={student.active ? "Activo" : "Inactivo"} /></dl><section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Clases impartidas</h2><form method="get" className="flex items-end gap-2"><label className="text-xs font-bold text-slate-500">Mes<Select name="month" defaultValue={String(month)}><option value="1">Enero</option><option value="2">Febrero</option><option value="3">Marzo</option><option value="4">Abril</option><option value="5">Mayo</option><option value="6">Junio</option><option value="7">Julio</option><option value="8">Agosto</option><option value="9">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></Select></label><label className="text-xs font-bold text-slate-500">Año<Select name="year" defaultValue={String(year)}>{years.map((value) => <option key={value} value={value}>{value}</option>)}</Select></label><button className="min-h-12 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white">Filtrar</button></form></div>{lessons.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No hay clases este mes.</div> : <div className="mt-4 space-y-2">{lessons.map(({ lesson }) => <Link key={lesson.id} href={`/classes/${lesson.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"><div><p className="font-black">{lesson.startsAt.toLocaleDateString("es-ES")} · {classTypeLabels[lesson.type]}</p><p className="mt-1 text-sm text-slate-500">{classStatusLabels[lesson.status]}</p></div><span className="font-bold">{formatMoney(lesson.ratePerStudentCents)}</span></Link>)}</div>}</section></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-4 text-sm"><dt className="font-bold text-slate-500">{label}</dt><dd className="text-right font-bold">{value}</dd></div>; }
