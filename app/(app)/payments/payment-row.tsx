"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";

import { togglePaid, upsertPayment } from "@/app/(app)/payments/actions";
import type { StudentPaymentRow } from "@/lib/db/queries";
import { cn } from "@/lib/utils";
import { fullName, toNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

export function PaymentRow({
  row,
  year,
  month,
}: {
  row: StudentPaymentRow;
  year: number;
  month: number;
}) {
  const [amount, setAmount] = useState<string>(
    row.amount != null ? String(toNumber(row.amount)) : ""
  );
  const [pending, startTransition] = useTransition();

  const paid = row.paid;

  const hidden = (
    <>
      <input type="hidden" name="studentId" value={row.studentId} />
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="month" value={month} />
    </>
  );

  const saveAmount = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("studentId", row.studentId);
      fd.set("year", String(year));
      fd.set("month", String(month));
      fd.set("amount", amount || "0");
      fd.set("paid", paid ? "true" : "false");
      await upsertPayment(fd);
    });
  };

  const toggle = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("studentId", row.studentId);
      fd.set("year", String(year));
      fd.set("month", String(month));
      fd.set("amount", amount || "0");
      fd.set("paid", paid ? "false" : "true");
      await togglePaid(fd);
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/students/${row.studentId}`} className="hover:underline">
          {fullName(row)}
        </Link>
        {hidden}
      </TableCell>
      <TableCell className="w-full max-w-40 sm:w-40">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={saveAmount}
            placeholder="0,00"
            aria-label="Importe"
            className="h-10 w-24"
          />
          <span className="text-sm text-muted-foreground">€</span>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {paid ? (
          <Badge className="gap-1">
            <Check className="size-3" aria-hidden="true" /> Pagado
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <X className="size-3" aria-hidden="true" /> Pendiente
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant={paid ? "outline" : "default"}
          size="sm"
          onClick={toggle}
          disabled={pending}
          className={cn(pending && "opacity-70")}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {paid ? "Marcar pendiente" : "Marcar pagado"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
