"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deletePayment } from "./actions";
import { Button } from "@/components/ui/button";

export function DeletePaymentButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Eliminar pago"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")) return;
        startTransition(() => deletePayment(id));
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
