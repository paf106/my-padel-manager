"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteStudent } from "@/app/(app)/students/actions";
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

export function DeleteStudentButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="size-4" /> Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar alumno</DialogTitle>
          <DialogDescription>
            ¿Seguro que quieres eliminar a <strong>{name}</strong>? Se
            eliminarán también sus pagos y su participación en clases. Esta
            acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteStudent(id);
              })
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
