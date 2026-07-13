"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { CLASS_STATUS_COLOR, CLASS_TYPE_LABELS } from "@/lib/labels";
import { formatTime, fullName } from "@/lib/format";
import type { ClassStatus, ClassType } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";

export type CalendarClass = {
  id: string;
  type: ClassType;
  status: ClassStatus;
  startsAt: string; // ISO
  students: { id: string; firstName: string; lastName: string }[];
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarMonth({
  year,
  month, // 1-12
  classes,
}: {
  year: number;
  month: number;
  classes: CalendarClass[];
}) {
  const router = useRouter();

  const monthDate = new Date(year, month - 1, 1);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const classesByDay = useMemo(() => {
    const map = new Map<string, CalendarClass[]>();
    for (const c of classes) {
      const key = format(new Date(c.startsAt), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return map;
  }, [classes]);

  const prev = () => {
    const d = new Date(year, month - 2, 1);
    router.push(`/calendar?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  };
  const next = () => {
    const d = new Date(year, month, 1);
    router.push(`/calendar?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  };
  const goToday = () => {
    const d = new Date();
    router.push(`/calendar?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold capitalize">
          {format(monthDate, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={prev} aria-label="Mes anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={next} aria-label="Mes siguiente">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Vista de agenda para mobile */}
      <div className="space-y-3 sm:hidden">
        {days
          .filter((day) => isSameMonth(day, monthDate))
          .map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayClasses = classesByDay.get(key) ?? [];
            if (dayClasses.length === 0) return null;

            return (
              <div key={key} className="rounded-xl border">
                <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <span className="text-sm font-medium capitalize text-muted-foreground">
                    {format(day, "EEEE", { locale: es })}
                  </span>
                </div>
                <div className="divide-y">
                  {dayClasses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/classes/${c.id}`}
                      className="flex min-h-11 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent"
                    >
                      <span
                        className={cn(
                          "inline-flex shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium",
                          CLASS_STATUS_COLOR[c.status]
                        )}
                      >
                        {formatTime(c.startsAt)}
                      </span>
                      <span className="truncate text-sm">
                        {c.students.length
                          ? c.students.map((s) => fullName(s)).join(", ")
                          : CLASS_TYPE_LABELS[c.type]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        {days
          .filter((day) => isSameMonth(day, monthDate))
          .every((day) => (classesByDay.get(format(day, "yyyy-MM-dd")) ?? []).length === 0) ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No hay clases programadas este mes.
          </p>
        ) : null}
      </div>

      {/* Vista de cuadrícula para escritorio */}
      <div className="hidden overflow-hidden rounded-xl border sm:block">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayClasses = classesByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, monthDate);

            return (
              <div
                key={key}
                className={cn(
                  "min-h-24 border-b border-r p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                  !inMonth && "bg-muted/20 text-muted-foreground"
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs",
                      isToday(day) &&
                        "bg-primary font-semibold text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayClasses.slice(0, 3).map((c) => (
                    <Link
                      key={c.id}
                      href={`/classes/${c.id}`}
                      className={cn(
                        "block truncate rounded border px-1.5 py-1 text-xs leading-tight transition-opacity hover:opacity-80",
                        CLASS_STATUS_COLOR[c.status]
                      )}
                      title={`${formatTime(c.startsAt)} · ${CLASS_TYPE_LABELS[c.type]}${
                        c.students.length
                          ? " · " + c.students.map((s) => fullName(s)).join(", ")
                          : ""
                      }`}
                    >
                      <span className="font-medium">{formatTime(c.startsAt)}</span>{" "}
                      {c.students.length
                        ? c.students.map((s) => s.firstName).join(", ")
                        : CLASS_TYPE_LABELS[c.type]}
                    </Link>
                  ))}
                  {dayClasses.length > 3 ? (
                    <span className="block px-1 text-xs text-muted-foreground">
                      +{dayClasses.length - 3} más
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
