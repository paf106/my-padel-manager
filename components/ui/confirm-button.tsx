"use client";

import { useRef } from "react";

export function ConfirmButton({ label, confirmLabel, children }: { label: React.ReactNode; confirmLabel: string; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <><button type="button" onClick={() => dialogRef.current?.showModal()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-3 py-3 text-sm font-bold text-white hover:bg-red-600">{label}</button><dialog ref={dialogRef} className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/40"><div className="p-5"><h2 className="text-lg font-black">¿Confirmar acción?</h2><p className="mt-2 text-sm text-slate-600">{confirmLabel}</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => dialogRef.current?.close()} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold">Cancelar</button>{children}</div></div></dialog></>;
}
