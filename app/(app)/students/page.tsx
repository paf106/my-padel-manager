import Link from "next/link";
import { asc, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { PageHeader } from "@/components/ui/page-header";
import { ClickableRow } from "@/components/ui/clickable-row";
import { StudentSearch } from "@/components/students/student-search";
import { levelLabels } from "@/lib/labels";
import { NewStudentDialog } from "@/components/students/new-student-dialog";
import { formatDateKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim() ?? "";
  const studentRows = await db
    .select()
    .from(students)
    .where(
      q
        ? or(
            ilike(students.firstName, `%${q}%`),
            ilike(students.lastName, `%${q}%`),
            ilike(students.phone, `%${q}%`),
          )
        : undefined,
    )
    .orderBy(asc(students.lastName));
  return (
    <main className="mx-auto min-h-screen max-w-5xl">
      <PageHeader title="Alumnos" eyebrow="Personas" action={<NewStudentDialog />} />
      <div className="mt-6">
        <StudentSearch initialQuery={q} />
      </div>
      {studentRows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No se han encontrado alumnos.
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-3 lg:hidden">
            {studentRows.map((student) => (
              <Link
                href={`/students/${student.id}`}
                key={student.id}
                className="block rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-black">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {levelLabels[student.level]} ·{" "}
                      {student.gender === "male" ? "Hombre" : "Mujer"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{student.phone || "Sin teléfono"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {student.birthDate
                        ? `Nacido el ${formatDateKey(student.birthDate)}`
                        : "Fecha de nacimiento no indicada"}
                    </p>
                  </div>
                  <span
                    className={`h-3 w-3 rounded-full ${student.active ? "bg-emerald-500" : "bg-slate-400"}`}
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nombre</th>
                  <th className="px-5 py-4">Nivel</th>
                  <th className="px-5 py-4">Sexo</th>
                  <th className="px-5 py-4">Teléfono</th>
                  <th className="px-5 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRows.map((student) => (
                  <ClickableRow
                    key={student.id}
                    href={`/students/${student.id}`}
                    className="hover:bg-emerald-50"
                  >
                    <td className="px-5 py-4 font-bold">
                      <Link href={`/students/${student.id}`}>
                        {student.firstName} {student.lastName}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{levelLabels[student.level]}</td>
                    <td className="px-5 py-4">{student.gender === "male" ? "Hombre" : "Mujer"}</td>
                    <td className="px-5 py-4">{student.phone || "-"}</td>
                    <td className="px-5 py-4">{student.active ? "Activo" : "Inactivo"}</td>
                  </ClickableRow>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
