import Link from "next/link";
import { and, asc, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { classStudents, classes, students } from "@/lib/db/schema";
import { classStatusLabels, classStatusTone, classTypeLabels } from "@/lib/labels";
import { shortStudentName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { MonthNavigation } from "@/components/calendar/month-navigation";
import { CalendarDayCell } from "@/components/calendar/calendar-day-cell";
import { WeekStrip } from "@/components/calendar/week-strip";
import { getCalendarDays, getStripDays, parseCalendarMonth } from "@/lib/calendar";
import { madridDateKey, madridMonthRange, madridTime, madridToday } from "@/lib/dates";
import { capitalizeFirst } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; day?: string }>;
}) {
  const params = await searchParams;
  const { year, month } = parseCalendarMonth(params.year, params.month);
  const monthDays = getCalendarDays(year, month);
  const selectedDay =
    params.day ??
    monthDays.cells.find((cell) => cell?.isToday)?.date ??
    monthDays.cells.find(Boolean)?.date ??
    `${year}-${String(month).padStart(2, "0")}-01`;
  const stripDays = getStripDays(year, month);
  const rangeStart = madridMonthRange(new Date(`${stripDays[0].date}T12:00:00Z`)).start;
  const rangeEnd = madridMonthRange(new Date(`${stripDays.at(-1)!.date}T12:00:00Z`)).end;
  const rows = await db
    .select({
      id: classes.id,
      type: classes.type,
      status: classes.status,
      startsAt: classes.startsAt,
    })
    .from(classes)
    .where(and(gte(classes.startsAt, rangeStart), lt(classes.startsAt, rangeEnd)))
    .orderBy(asc(classes.startsAt));
  const byDay = new Map<string, typeof rows>();
  for (const item of rows) {
    const key = madridDateKey(item.startsAt);
    byDay.set(key, [...(byDay.get(key) ?? []), item]);
  }
  const selectedClasses = byDay.get(selectedDay) ?? [];
  const rosterRows = selectedClasses.length
    ? await db
        .select({
          classId: classStudents.classId,
          firstName: students.firstName,
          lastName: students.lastName,
        })
        .from(classStudents)
        .innerJoin(students, eq(classStudents.studentId, students.id))
        .where(
          inArray(
            classStudents.classId,
            selectedClasses.map((item) => item.id),
          ),
        )
        .orderBy(asc(students.firstName))
    : [];
  const studentsByClass = new Map<string, string[]>();
  for (const student of rosterRows) {
    studentsByClass.set(student.classId, [
      ...(studentsByClass.get(student.classId) ?? []),
      shortStudentName(student.firstName, student.lastName),
    ]);
  }
  const classDays = new Set(rows.map((item) => madridDateKey(item.startsAt)));

  return (
    <main className="mx-auto max-w-5xl">
      <div className="hidden lg:block">
        <PageHeader title={capitalizeFirst(monthDays.monthName)} eyebrow="Agenda" />
        <div className="mt-6 flex justify-end">
          <MonthNavigation year={year} month={month} />
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-white p-4">
          <div className="grid grid-cols-7 gap-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-bold uppercase text-muted">
                {day}
              </div>
            ))}
            {monthDays.cells.map((cell, index) =>
              cell ? (
                <CalendarDayCell
                  key={cell.date}
                  date={cell.date}
                  dayNumber={cell.dayNumber}
                  isToday={cell.isToday}
                  classes={(byDay.get(cell.date) ?? []).map((item) => ({
                    id: item.id,
                    time: madridTime(item.startsAt),
                    type: classTypeLabels[item.type],
                    statusTone: classStatusTone(item.status),
                    statusLabel: classStatusLabels[item.status],
                  }))}
                />
              ) : (
                <div
                  key={`empty-${index}`}
                  className="min-h-28 rounded-xl border border-transparent"
                />
              ),
            )}
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <PageHeader title="Calendario" eyebrow="Agenda" />
        <WeekStrip
          days={stripDays}
          selectedDay={selectedDay}
          year={year}
          month={month}
          classDays={classDays}
          today={madridToday()}
        />
        <section className="mt-4">
          <h2 className="text-lg font-black">Clases del día</h2>
          {selectedClasses.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              No hay clases programadas.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedClasses.map((item) => (
                <Link
                  key={item.id}
                  href={`/classes/${item.id}`}
                  className="block rounded-2xl border border-border bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black">{madridTime(item.startsAt)}</p>
                    <Badge tone={classStatusTone(item.status)}>
                      {classStatusLabels[item.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{classTypeLabels[item.type]}</p>
                  <p
                    className="mt-2 truncate text-sm font-bold text-slate-700"
                    title={studentsByClass.get(item.id)?.join(", ") || "Sin alumnos"}
                  >
                    {studentsByClass.get(item.id)?.join(", ") || "Sin alumnos"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
