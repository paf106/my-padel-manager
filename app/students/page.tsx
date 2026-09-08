import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";

const levels = { intro: "Iniciación", beginner: "Principiante", intermediate: "Medio", advanced: "Avanzado", competition: "Competición" } as const;
export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const studentRows = await db.select().from(students).orderBy(asc(students.lastName));
  return <main className="mx-auto min-h-screen max-w-2xl px-5 pb-28 pt-8"><header className="flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Personas</p><h1 className="mt-2 text-3xl font-black">Alumnos</h1></div><Link href="/students/new" className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Nuevo alumno</Link></header>{studentRows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Todavía no hay alumnos.</div> : <div className="mt-8 space-y-3">{studentRows.map((student) => <article key={student.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div><h2 className="font-black">{student.firstName} {student.lastName}</h2><p className="mt-1 text-sm text-slate-500">{levels[student.level]}{student.phone ? ` · ${student.phone}` : ""}</p></div><span className="h-3 w-3 rounded-full bg-emerald-500" title="Alumno activo" /></div></article>)}</div>}</main>;
}
