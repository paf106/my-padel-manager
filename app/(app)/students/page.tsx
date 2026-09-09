import Link from "next/link";
import { asc } from "drizzle-orm";
import { UserPlus } from "lucide-react";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { Fab } from "@/components/ui/fab";
import { PageHeader } from "@/components/ui/page-header";
import { levelLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const studentRows = await db.select().from(students).orderBy(asc(students.lastName));
  return <main className="mx-auto min-h-screen max-w-5xl"><PageHeader title="Alumnos" eyebrow="Personas" action={<Link href="/students/new" className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white">Nuevo alumno</Link>} /><Fab href="/students/new" label="Nuevo alumno" icon={UserPlus} />{studentRows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Todavía no hay alumnos.</div> : <><div className="mt-8 space-y-3 lg:hidden">{studentRows.map((student) => <Link href={`/students/${student.id}`} key={student.id} className="block rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div><h2 className="font-black">{student.firstName} {student.lastName}</h2><p className="mt-1 text-sm text-slate-500">{levelLabels[student.level]}{student.phone ? ` · ${student.phone}` : ""}</p></div><span className="h-3 w-3 rounded-full bg-emerald-500" title="Alumno activo" /></div></Link>)}</div><div className="mt-8 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Nombre</th><th className="px-5 py-4">Nivel</th><th className="px-5 py-4">Sexo</th><th className="px-5 py-4">Teléfono</th><th className="px-5 py-4">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{studentRows.map((student) => <tr key={student.id} className="hover:bg-emerald-50"><td className="px-5 py-4 font-bold"><Link href={`/students/${student.id}`}>{student.firstName} {student.lastName}</Link></td><td className="px-5 py-4">{levelLabels[student.level]}</td><td className="px-5 py-4">{student.gender === "male" ? "Hombre" : "Mujer"}</td><td className="px-5 py-4">{student.phone || "-"}</td><td className="px-5 py-4 text-emerald-700">{student.active ? "Activo" : "Inactivo"}</td></tr>)}</tbody></table></div></>}</main>;
}
