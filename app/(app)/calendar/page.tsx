import { listClassesForMonth, listStudentsBasic } from "@/lib/db/queries";
import { PageHeader } from "@/components/page-header";
import { ClassFormDialog } from "../classes/class-form-dialog";
import { CalendarMonth, type CalendarClass } from "./calendar-month";

export const dynamic = "force-dynamic";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { year: yParam, month: mParam } = await searchParams;
  const now = new Date();

  const year = clampInt(yParam, now.getFullYear(), 1970, 3000);
  const month = clampInt(mParam, now.getMonth() + 1, 1, 12);

  const [rows, students] = await Promise.all([
    listClassesForMonth(year, month),
    listStudentsBasic(),
  ]);

  const classes: CalendarClass[] = rows.map((c) => ({
    id: c.id,
    type: c.type,
    status: c.status,
    startsAt: c.startsAt.toISOString(),
    students: c.students,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        description="Visualiza tus clases por día."
        action={<ClassFormDialog students={students} />}
      />

      <CalendarMonth year={year} month={month} classes={classes} />
    </div>
  );
}

function clampInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const n = value ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n) || n < min || n > max) return fallback;
  return n;
}
