"use client";

import { useActionState, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus } from "lucide-react";

import {
  createClass,
  updateClass,
  type ClassFormState,
} from "@/app/(app)/classes/actions";
import type { ClassWithStudents } from "@/lib/db/queries";
import { CLASS_STATUS_OPTIONS, CLASS_TYPE_OPTIONS } from "@/lib/labels";
import { toDatetimeLocalValue, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MultiStudentSelect,
  type StudentOption,
} from "./multi-student-select";

const initialState: ClassFormState = { ok: false };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function ClassFormDialog({
  students,
  cls,
  triggerVariant = "default",
}: {
  students: StudentOption[];
  cls?: ClassWithStudents;
  triggerVariant?: "default" | "edit";
}) {
  const isEdit = Boolean(cls);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const formId = useId();

  const action = isEdit ? updateClass.bind(null, cls!.id) : createClass;

  const runAction = async (prev: ClassFormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    }
    return result;
  };

  const [state, formAction, pending] = useActionState(runAction, initialState);

  const defaultStartsAt = cls
    ? toDatetimeLocalValue(cls.startsAt)
    : toDatetimeLocalValue(defaultNextHour());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit || triggerVariant === "edit" ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nueva clase
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar clase" : "Nueva clase"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la clase."
              : "Registra una nueva clase particular."}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo de clase</Label>
              <Select name="type" defaultValue={cls?.type ?? "individual"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select name="status" defaultValue={cls?.status ?? "pending"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-startsAt`}>Fecha y hora</Label>
              <Input
                id={`${formId}-startsAt`}
                name="startsAt"
                type="datetime-local"
                defaultValue={defaultStartsAt}
                required
              />
              <FieldError errors={state.fieldErrors?.startsAt} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-durationMin`}>Duración (min)</Label>
              <Input
                id={`${formId}-durationMin`}
                name="durationMin"
                type="number"
                min={0}
                step={5}
                defaultValue={cls?.durationMin ?? 60}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-courtPrice`}>Precio pista (€)</Label>
              <Input
                id={`${formId}-courtPrice`}
                name="courtPrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={cls ? toNumber(cls.courtPrice) : 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-classPrice`}>Precio clase (€)</Label>
              <Input
                id={`${formId}-classPrice`}
                name="classPrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={cls ? toNumber(cls.classPrice) : 0}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Alumnos</Label>
            <MultiStudentSelect
              options={students}
              defaultSelectedIds={cls?.students.map((s) => s.id) ?? []}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-notes`}>Comentario</Label>
            <Textarea
              id={`${formId}-notes`}
              name="notes"
              defaultValue={cls?.notes ?? ""}
              placeholder="Notas sobre la clase…"
              rows={3}
            />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isEdit ? "Guardar cambios" : "Crear clase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function defaultNextHour() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}
