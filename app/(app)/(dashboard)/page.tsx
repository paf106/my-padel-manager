import Link from "next/link";
import { and, asc, eq, gte, inArray, lt, sql, sum } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Settings } from "lucide-react";
import { db } from "@/lib/db";
import { classStudents, classes, payments, students } from "@/lib/db/schema";
import { RevenueChart } from "@/components/revenue-chart";
import { formatMoney, shortStudentName } from "@/lib/format";
import { classTypeLabels } from "@/lib/labels";
import {
  madridFormat,
  madridDayMonth,
  madridMonthKey,
  madridMonthKeys,
  madridNextMonthStartKey,
  madridRecentMonthStartKey,
  madridUpcomingRange,
} from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const upcomingRange = madridUpcomingRange(now);
  const period = `${madridMonthKey(now)}-01`;
  const [upcoming, currentPayments, recentPayments] = await Promise.all([
    db
      .select({
        id: classes.id,
        type: classes.type,
        status: classes.status,
        startsAt: classes.startsAt,
      })
      .from(classes)
      .where(
        and(gte(classes.startsAt, upcomingRange.start), lt(classes.startsAt, upcomingRange.end)),
      )
      .orderBy(asc(classes.startsAt))
      .limit(3),
    db
      .select({
        paid: sum(payments.paidAmountCents),
        due: sum(sql`coalesce(${payments.overrideAmountCents}, ${payments.computedAmountCents})`),
      })
      .from(payments)
      .where(and(gte(payments.period, period), lt(payments.period, madridNextMonthStartKey(now)))),
    db
      .select({ period: payments.period, paid: sum(payments.paidAmountCents) })
      .from(payments)
      .where(gte(payments.period, madridRecentMonthStartKey(now)))
      .groupBy(payments.period),
  ]);
  const rosterRows = upcoming.length
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
            upcoming.map((item) => item.id),
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
  const paidByMonth = new Map(
    recentPayments.map((payment) => [payment.period.slice(0, 7), Number(payment.paid ?? 0)]),
  );
  const chartData = madridMonthKeys(now).map((month) => {
    const date = new Date(`${month}-01T12:00:00Z`);
    return {
      label: format(date, "MMM", { locale: es }),
      amount: (paidByMonth.get(month) ?? 0) / 100,
    };
  });
  const paid = Number(currentPayments[0]?.paid ?? 0);
  const due = Number(currentPayments[0]?.due ?? 0);
  return (
    <main className="mx-auto min-h-screen max-w-7xl">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Padel Ledger
          </p>
          <h1 className="text-3xl font-black tracking-tight">Buenos días</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tu resumen de {format(now, "MMMM", { locale: es })}
          </p>
        </div>
        <Link
          href="/settings"
          aria-label="Ajustes"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-slate-600 lg:hidden"
        >
          <Settings size={20} />
        </Link>
      </header>
      <div className="grid gap-5 lg:grid-cols-12">
        <section className="rounded-3xl bg-emerald-900 p-6 text-white lg:col-span-8">
          <p className="text-sm text-emerald-100">Cobrado este mes</p>
          <p className="mt-5 text-4xl font-black">{formatMoney(paid)}</p>
          <div className="mt-6">
            <RevenueChart data={chartData} />
          </div>
        </section>
        <section className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
          <Metric label="Próximas clases" value={String(upcoming.length)} detail="en 7 días" />
          <Metric
            label="Pendiente de cobro"
            value={formatMoney(Math.max(0, due - paid))}
            detail="este mes"
          />
        </section>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-black">Próximas clases</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <CalendarDays className="mx-auto mb-3 text-slate-400" />
            <p className="font-bold">Todavía no hay clases</p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {upcoming.map((item) => (
              <Link
                key={item.id}
                href={`/classes/${item.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <p className="font-black">
                  {madridDayMonth(item.startsAt)} · {madridFormat(item.startsAt, "HH:mm")}
                </p>
                <p className="mt-1 text-sm text-slate-500">{classTypeLabels[item.type]}</p>
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
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
