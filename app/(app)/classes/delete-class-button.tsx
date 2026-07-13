"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteClass } from "@/app/(app)/classes/actions";
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

export function DeleteClassButton({ id }: { id: string }) {
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
          <DialogTitle>Eliminar clase</DialogTitle>
          <DialogDescription>
            ¿Seguro que quieres eliminar esta clase? Esta acción no se puede
            deshacer.
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
                await deleteClass(id);
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
