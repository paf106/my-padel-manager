import Link from "next/link";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { classStudents, classes, students } from "@/lib/db/schema";
import { levelLabels, genderLabels, classStatusLabels, classTypeLabels } from "@/lib/labels";
import { formatMoney } from "@/lib/format";
import { parseCalendarMonth } from "@/lib/calendar";
import {
  formatDateKey,
  madridDate,
  madridDateKey,
  madridMonthRange,
  madridTime,
} from "@/lib/dates";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/page-header";
import { StudentPeriodFilters } from "@/components/students/student-period-filters";
import { Alert } from "@/components/ui/alert";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Edit, Trash2 } from "lucide-react";
import { deleteStudent } from "../actions";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string; error?: string }>;
}) {
  const [{ id }, filter] = await Promise.all([params, searchParams]);
  const { year, month } = parseCalendarMonth(filter.year, filter.month);
  const range = madridMonthRange(new Date(Date.UTC(year, month - 1, 15)));
  const [[student], lessons, yearRows] = await Promise.all([
    db.select().from(students).where(eq(students.id, id)),
    db
      .select({ lesson: classes })
      .from(classStudents)
      .innerJoin(classes, eq(classStudents.classId, classes.id))
      .where(
        and(
          eq(classStudents.studentId, id),
          gte(classes.startsAt, range.start),
          lt(classes.startsAt, range.end),
        ),
      )
      .orderBy(classes.startsAt),
    db
      .select({ startsAt: classes.startsAt })
      .from(classStudents)
      .innerJoin(classes, eq(classStudents.classId, classes.id))
      .where(eq(classStudents.studentId, id)),
  ]);
  if (!student)
    return (
      <main className="mx-auto max-w-3xl">
        <BackLink href="/students" label="Volver a alumnos" />
        <p className="mt-6">Alumno no encontrado.</p>
      </main>
    );
  const years = Array.from(
    new Set(
      yearRows.map(({ startsAt }) => Number(madridDateKey(startsAt).slice(0, 4))).concat(year),
    ),
  ).sort((a, b) => b - a);
  return (
    <main className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-2">
        <BackLink href="/students" label="Volver a alumnos" />
        <div className="flex gap-2">
          <Link
            href={`/students/${id}/edit`}
            aria-label="Editar alumno"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3 py-3 text-sm font-bold text-white"
          >
            <Edit size={18} />
            <span className="sr-only lg:not-sr-only">Editar</span>
          </Link>
          <ConfirmButton
            label={
              <>
                <Trash2 size={18} />
                <span className="sr-only lg:not-sr-only">Eliminar</span>
              </>
            }
            ariaLabel="Eliminar alumno"
            confirmLabel={
              yearRows.length > 0
                ? `No se puede eliminar: el alumno participa en ${yearRows.length} clase${yearRows.length === 1 ? "" : "s"}. Quítalo primero de esas clases.`
                : "El alumno y sus pagos se eliminarán definitivamente."
            }
          >
            {yearRows.length === 0 ? (
              <form action={deleteStudent.bind(null, id)}>
                <button className="min-h-11 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white">
                  Eliminar
                </button>
              </form>
            ) : null}
          </ConfirmButton>
        </div>
      </div>
      {filter.error === "has-classes" && (
        <Alert>El alumno no se puede eliminar mientras tenga clases asignadas.</Alert>
      )}
      <PageHeader title={`${student.firstName} ${student.lastName}`} className="mt-6" />
      <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
        <Info label="Nivel" value={levelLabels[student.level]} />
        <Info label="Sexo" value={genderLabels[student.gender]} />
        <Info label="Teléfono" value={student.phone || "-"} />
        <Info
          label="Fecha de nacimiento"
          value={student.birthDate ? formatDateKey(student.birthDate) : "-"}
        />
        <Info label="Estado" value={student.active ? "Activo" : "Inactivo"} />
      </dl>
      <section className="mt-8">
        <h2 className="text-xl font-black">Clases impartidas</h2>
        <div className="mt-3">
          <StudentPeriodFilters year={year} month={month} years={years} />
        </div>
        {lessons.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No hay clases en este periodo.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {lessons.map(({ lesson }) => (
              <Link
                key={lesson.id}
                href={`/classes/${lesson.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <div>
                  <p className="font-black">
                    {madridDate(lesson.startsAt)} · {classTypeLabels[lesson.type]}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {classStatusLabels[lesson.status]} · {madridTime(lesson.startsAt)}
                  </p>
                </div>
                <strong>{formatMoney(lesson.ratePerStudentCents)}</strong>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-4 text-sm">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}
