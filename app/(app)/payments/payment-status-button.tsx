"use client";

import { useTransition } from "react";
import { togglePaymentPaid } from "./actions";
import { Badge } from "@/components/ui/badge";

export function PaymentStatusButton({ id, paid }: { id: string; paid: boolean }) {
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => startTransition(() => { void togglePaymentPaid(id, !paid); })} className="cursor-pointer disabled:cursor-wait"><Badge variant={paid ? "default" : "secondary"}>{pending ? "Guardando…" : paid ? "Pagado" : "Pendiente"}</Badge></button>;
}
