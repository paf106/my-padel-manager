"use client";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { capitalizeFirst } from "@/lib/text";

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthPicker({
  year,
  month,
  selectedDay,
  today,
  classDays,
}: {
  year: number;
  month: number;
  selectedDay: string;
  today: string;
  classDays: string[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [view, setView] = useState({ year, month });
  const classDaySet = useMemo(() => new Set(classDays), [classDays]);
  const cells = useMemo(() => getPickerCells(view.year, view.month), [view.month, view.year]);
  const titleFormatter = useMemo(
    () => new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }),
    [],
  );
  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );
  const title = capitalizeFirst(
    titleFormatter.format(new Date(Date.UTC(view.year, view.month - 1, 1))),
  );
  const selectedLabel = capitalizeFirst(dayFormatter.format(new Date(`${selectedDay}T12:00:00Z`)));
  function selectDay(date: string) {
    const [selectedYear, selectedMonth] = date.split("-").map(Number);
    dialogRef.current?.close();
    router.push(`/calendar?year=${selectedYear}&month=${selectedMonth}&day=${date}`);
  }
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setView({ year, month });
          dialogRef.current?.showModal();
        }}
        aria-label={`Elegir día: ${selectedLabel}`}
        className="inline-flex items-center gap-2 text-lg font-bold"
      >
        {selectedLabel}
        <ChevronDown size={20} className="text-slate-500" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="month-picker-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/50"
      >
        <div className="bg-emerald-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setView(previousMonth(view.year, view.month))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900"
            >
              <ChevronLeft size={22} />
            </button>
            <h2 id="month-picker-title" className="text-lg font-black">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setView(nextMonth(view.year, view.month))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 text-center text-xs font-bold uppercase">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-2 p-4">
          {cells.map((cell) => {
            const hasClass = cell.monthOffset === 0 && classDaySet.has(cell.date);
            const isSelected = cell.date === selectedDay;
            const isToday = cell.date === today;
            return (
              <button
                key={cell.date}
                type="button"
                aria-current={isToday ? "date" : undefined}
                aria-pressed={isSelected}
                onClick={() => selectDay(cell.date)}
                className={`relative flex h-11 items-center justify-center rounded-full text-sm font-bold ${cell.monthOffset !== 0 ? "text-slate-500" : isSelected ? "text-white" : isToday ? "text-emerald-700" : "text-slate-700"} ${isSelected ? "bg-emerald-600" : "hover:bg-emerald-50"}`}
              >
                {cell.day}
                {hasClass && (
                  <span
                    className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-lime-500"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </dialog>
    </>
  );
}

function previousMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}
function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}
function getPickerCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = first.getUTCDay() === 0 ? 6 : first.getUTCDay() - 1;
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const previousTotal = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  const cells = Array.from({ length: offset }, (_, index) => {
    const day = previousTotal - offset + index + 1;
    const date = new Date(Date.UTC(year, month - 2, day));
    return { date: date.toISOString().slice(0, 10), day, monthOffset: -1 };
  });
  cells.push(
    ...Array.from({ length: total }, (_, index) => ({
      date: `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
      day: index + 1,
      monthOffset: 0,
    })),
  );
  const trailing = (7 - (cells.length % 7)) % 7;
  cells.push(
    ...Array.from({ length: trailing }, (_, index) => {
      const date = new Date(Date.UTC(year, month, index + 1));
      return { date: date.toISOString().slice(0, 10), day: index + 1, monthOffset: 1 };
    }),
  );
  return cells;
}
