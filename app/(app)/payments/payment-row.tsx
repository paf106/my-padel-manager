import Link from "next/link";
import { formatCurrency, formatDate, formatDateTime, fullName } from "@/lib/format";
import type { MonthlyDraft } from "@/lib/billing";
import type { StudentPaymentRow } from "@/lib/db/queries";
import { TableCell, TableRow } from "@/components/ui/table";
import { DeletePaymentButton } from "./delete-payment-button";
import { RecalculatePaymentButton } from "./recalculate-payment-button";
import { PaymentStatusButton } from "./payment-status-button";

export function PaymentRow({ row, freshDraft }: { row: StudentPaymentRow; freshDraft?: MonthlyDraft }) {
  const stale = freshDraft ? freshDraft.total !== row.amount || freshDraft.lines.length !== row.classes.length || freshDraft.lines.some((line) => !row.classes.some((item) => item.id === line.classId && item.amount === line.amount)) : row.classes.length > 0 || Number(row.amount) > 0;
  return <TableRow>
    <TableCell className="font-medium"><Link href={`/students/${row.student.id}`} className="hover:underline">{fullName(row.student)}</Link></TableCell>
    <TableCell className="hidden md:table-cell">{row.classes.length ? <div className="space-y-0.5 text-sm">{row.classes.map((cls) => <p key={cls.id}>{formatDateTime(cls.startsAt)} · {formatCurrency(cls.amount)}</p>)}</div> : <span className="text-muted-foreground">Sin clases</span>}</TableCell>
    <TableCell className="text-right tabular-nums">{formatCurrency(row.amount)}</TableCell>
    <TableCell><PaymentStatusButton id={row.id} paid={row.paid} />{stale ? <div className="mt-1"><span className="text-xs font-medium text-destructive">Desactualizado</span></div> : null}</TableCell>
    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(row.paidAt)}</TableCell>
    <TableCell className="text-right"><div className="flex justify-end gap-1">{stale ? <RecalculatePaymentButton id={row.id} /> : null}<DeletePaymentButton id={row.id} /></div></TableCell>
  </TableRow>;
}
