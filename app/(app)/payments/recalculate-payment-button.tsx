"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { recalculatePayment } from "./actions";
import { Button } from "@/components/ui/button";

export function RecalculatePaymentButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return <Button type="button" variant="outline" size="icon" title="Recalcular pago" disabled={pending} onClick={() => startTransition(() => { void recalculatePayment(id); })}><RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} /><span className="sr-only">Recalcular pago</span></Button>;
}
