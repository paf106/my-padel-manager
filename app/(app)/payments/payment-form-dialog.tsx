"use client";

import { useActionState, useId, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { generateMonthlyPayments, type PaymentFormState } from "./actions";
import type { MonthlyDraft } from "@/lib/billing";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const initialState: PaymentFormState = { ok: false };

export function PaymentFormDialog({ year, month, drafts, existingStudentIds }: { year: number; month: number; drafts: MonthlyDraft[]; existingStudentIds: string[] }) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const [state, formAction, pending] = useActionState(async (prev: PaymentFormState, formData: FormData) => {
    const result = await generateMonthlyPayments(prev, formData);
    if (result.ok) setOpen(false);
    return result;
  }, initialState);
  const available = drafts.filter((draft) => !existingStudentIds.includes(draft.studentId));

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button><Plus className="size-4" /> Generar pagos del mes</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Revisar pagos de {new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1))}</DialogTitle>
        <DialogDescription>Solo se incluyen clases completadas. La pista se suma al precio de la clase y el total se reparte entre los alumnos.</DialogDescription>
      </DialogHeader>
      {drafts.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No hay clases completadas este mes.</p> : <form id={formId} action={formAction} className="space-y-3">
        <input type="hidden" name="year" value={year} /><input type="hidden" name="month" value={month} />
        {drafts.map((draft) => {
          const alreadyExists = existingStudentIds.includes(draft.studentId);
          return <div key={draft.studentId} className={`rounded-lg border p-3 ${alreadyExists ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <Checkbox name="studentIds" value={draft.studentId} defaultChecked={!alreadyExists} disabled={alreadyExists} className="mt-1" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap justify-between gap-2"><Label className="font-medium">{draft.studentName}</Label><span className="font-semibold tabular-nums">{formatCurrency(draft.total)}</span></div>
                {alreadyExists ? <p className="text-xs text-muted-foreground">Ya tiene un pago generado para este mes.</p> : null}
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">{draft.lines.map((line) => <p key={line.classId} className="flex flex-wrap justify-between gap-2"><span>{formatDateTime(line.startsAt)} · {formatCurrency(line.classPrice)} clase + {formatCurrency(line.courtPrice)} pista ÷ {line.studentCount}</span><span className="tabular-nums">{formatCurrency(line.amount)}</span></p>)}</div>
              </div>
            </div>
          </div>;
        })}
        {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      </form>}
      <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" form={formId} disabled={pending || !available.length || !drafts.length}>{pending ? <Loader2 className="size-4 animate-spin" /> : null} Confirmar y crear {available.length} pagos</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
