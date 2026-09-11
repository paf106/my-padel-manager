"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import { createStudent } from "@/app/(app)/students/actions";
import { StudentForm } from "@/components/students/student-form";
import { Fab } from "@/components/ui/fab";

export function NewStudentDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleSuccess() {
    closeDialog();
    router.refresh();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => triggerRef.current?.focus();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        className="hidden rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 lg:inline-flex"
      >
        Nuevo alumno
      </button>
      <Fab label="Nuevo alumno" icon={UserPlus} onClick={openDialog} />
      <dialog
        ref={dialogRef}
        aria-labelledby="new-student-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        className="student-dialog m-0 mt-auto max-h-[92vh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-slate-200 bg-[#f6f7f2] p-0 shadow-2xl backdrop:bg-slate-950/50 lg:m-auto lg:max-w-2xl lg:rounded-2xl"
      >
        <div className="p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                Alumnos
              </p>
              <h2 id="new-student-title" className="mt-1 text-2xl font-black tracking-tight">
                Nuevo alumno
              </h2>
            </div>
            <button
              type="button"
              aria-label="Cerrar formulario"
              onClick={closeDialog}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200"
            >
              <X size={21} />
            </button>
          </div>
          <StudentForm
            action={createStudent}
            submitLabel="Guardar alumno"
            onSuccess={handleSuccess}
          />
        </div>
      </dialog>
    </>
  );
}
