"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type Student = { id: string; firstName: string; lastName: string; active?: boolean };

export function StudentPicker({
  students,
  selectedIds = [],
}: {
  students: Student[];
  selectedIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set(selectedIds));
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const normalizedQuery = query.toLocaleLowerCase();
  const visible = useMemo(
    () =>
      students.filter((student) =>
        `${student.firstName} ${student.lastName}`.toLocaleLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery, students],
  );
  const chosen = useMemo(
    () => students.filter((student) => selected.has(student.id)),
    [selected, students],
  );

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function closePicker() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div ref={ref} className="relative lg:col-span-2">
      <p className="text-sm font-bold">Alumnos</p>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="mt-2 flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-sm"
      >
        <span>
          {selected.size === 0
            ? "Selecciona alumnos"
            : `${selected.size} alumno${selected.size === 1 ? "" : "s"} seleccionado${selected.size === 1 ? "" : "s"}`}
        </span>
        <ChevronDown size={18} className="text-slate-500" />
      </button>
      {chosen.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chosen.map((student) => (
            <span
              key={student.id}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900"
            >
              {student.firstName} {student.lastName}
              {student.active === false && " (inactivo)"}
              <button
                type="button"
                aria-label={`Quitar a ${student.firstName} ${student.lastName}`}
                onClick={() => toggle(student.id)}
                className="inline-flex h-6 w-6 items-center justify-center"
              >
                <X size={14} />
              </button>
              <input type="hidden" name="studentIds" value={student.id} />
            </span>
          ))}
        </div>
      )}
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Seleccionar alumnos"
          className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closePicker();
            }
          }}
        >
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <span className="sr-only">Buscar alumnos</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar alumno..."
              className="h-11 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm"
            />
          </label>
          <div className="mt-2 max-h-64 overflow-y-auto" aria-live="polite" aria-atomic="true">
            {visible.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">No se han encontrado alumnos.</p>
            ) : (
              visible.map((student) => (
                <label
                  key={student.id}
                  role="option"
                  aria-selected={selected.has(student.id)}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm hover:bg-emerald-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(student.id)}
                    onChange={() => toggle(student.id)}
                  />
                  <span>
                    {student.firstName} {student.lastName}
                    {student.active === false && (
                      <span className="text-slate-500"> (inactivo)</span>
                    )}
                  </span>
                  {selected.has(student.id) && (
                    <Check size={16} className="ml-auto text-emerald-700" />
                  )}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
