"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

type CalendarClass = {
  id: string;
  time: string;
  type: string;
  statusTone: "neutral" | "success" | "warning" | "danger";
  statusLabel: string;
};

export function CalendarDayCell({
  date,
  dayNumber,
  isToday,
  classes,
}: {
  date: string;
  dayNumber: number;
  isToday: boolean;
  classes: CalendarClass[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visibleClasses = classes.slice(0, 2);
  const remainingCount = classes.length - visibleClasses.length;
  const formattedDate = new Date(`${date}T12:00:00Z`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`relative h-28 rounded-xl border p-2 ${isToday ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenuOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={`Crear clase o serie el ${formattedDate}`}
        className="absolute inset-0 z-0 rounded-xl"
        onClick={() => setMenuOpen(true)}
      />
      <div className="relative z-10 flex h-7 items-center justify-between">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-primary text-white" : "text-slate-800"}`}
        >
          {dayNumber}
        </span>
        {remainingCount > 0 && (
          <button
            type="button"
            className="rounded-md px-1.5 py-1 text-xs font-black text-primary hover:bg-primary-soft"
            onClick={() => dialogRef.current?.showModal()}
          >
            +{remainingCount}
          </button>
        )}
      </div>
      <div className="relative z-10 mt-1 space-y-1">
        {visibleClasses.map((item) => (
          <Link
            key={item.id}
            href={`/classes/${item.id}`}
            className={`block truncate rounded-md px-1.5 py-1 text-[11px] font-bold ${item.statusTone === "success" ? "bg-primary-soft text-primary-hover" : item.statusTone === "danger" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}
          >
            {item.time} · {item.type}
          </Link>
        ))}
      </div>
      {menuOpen && (
        <div
          role="menu"
          className="absolute left-2 top-12 z-30 grid w-40 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <Link
            href={`/classes/new?date=${date}`}
            className="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50"
            onClick={() => setMenuOpen(false)}
          >
            Crear clase
          </Link>
          <Link
            href={`/classes/series/new?date=${date}`}
            className="rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50"
            onClick={() => setMenuOpen(false)}
          >
            Crear serie
          </Link>
        </div>
      )}
      <dialog
        ref={dialogRef}
        aria-labelledby={`classes-${date}`}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/40"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 id={`classes-${date}`} className="text-lg font-black">
            Clases del {formattedDate}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => dialogRef.current?.close()}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-2 p-5">
          {classes.map((item) => (
            <Link
              key={item.id}
              href={`/classes/${item.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="truncate">
                {item.time} · {item.type}
              </span>
              <Badge tone={item.statusTone}>{item.statusLabel}</Badge>
            </Link>
          ))}
        </div>
      </dialog>
    </div>
  );
}
