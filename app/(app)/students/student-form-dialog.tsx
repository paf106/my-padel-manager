"use client";

import { useActionState, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";

import {
  createStudent,
  updateStudent,
  type StudentFormState,
} from "@/app/(app)/students/actions";
import type { Student } from "@/lib/db/schema";
import { GENDER_OPTIONS, LEVEL_OPTIONS } from "@/lib/labels";
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

const initialState: StudentFormState = { ok: false };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function StudentFormDialog({ student }: { student?: Student }) {
  const isEdit = Boolean(student);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const formId = useId();

  const action = isEdit
    ? updateStudent.bind(null, student!.id)
    : createStudent;

  // Wrap the action to close the dialog and refresh after a successful submit,
  // avoiding setState inside an effect.
  const runAction = async (prev: StudentFormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    }
    return result;
  };

  const [state, formAction, pending] = useActionState(runAction, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" /> Editar
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nuevo alumno
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar alumno" : "Nuevo alumno"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del alumno."
              : "Añade un nuevo alumno a tu lista."}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-firstName`}>Nombre</Label>
              <Input
                id={`${formId}-firstName`}
                name="firstName"
                defaultValue={student?.firstName ?? ""}
                required
                autoFocus
              />
              <FieldError errors={state.fieldErrors?.firstName} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-lastName`}>Apellidos</Label>
              <Input
                id={`${formId}-lastName`}
                name="lastName"
                defaultValue={student?.lastName ?? ""}
              />
              <FieldError errors={state.fieldErrors?.lastName} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-birthDate`}>
                Fecha de nacimiento
              </Label>
              <Input
                id={`${formId}-birthDate`}
                name="birthDate"
                type="date"
                defaultValue={student?.birthDate ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-phone`}>Teléfono</Label>
              <Input
                id={`${formId}-phone`}
                name="phone"
                type="tel"
                defaultValue={student?.phone ?? ""}
                placeholder="600 000 000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nivel</Label>
              <Select name="level" defaultValue={student?.level ?? "beginner_intro"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona nivel" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sexo</Label>
              <Select name="gender" defaultValue={student?.gender ?? ""}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sin especificar" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isEdit ? "Guardar cambios" : "Crear alumno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
