import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentLines, payments, students } from "@/lib/db/schema";
import { updatePayment } from "./actions";
import { BackLink } from "@/components/ui/back-link";
import { Input, Select, Textarea, Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select({ payment: payments, student: students }).from(payments).innerJoin(students, eq(payments.studentId, students.id)).where(eq(payments.id, id));
  if (!row) return <main className="mx-auto max-w-4xl"><BackLink href="/payments" label="Volver a pagos" /><p className="mt-6">Pago no encontrado.</p></main>;
  const lines = await db.select().from(paymentLines).where(eq(paymentLines.paymentId, id));
  const due = row.payment.overrideAmountCents ?? row.payment.computedAmountCents;
  return <main className="mx-auto min-h-screen max-w-4xl pb-12"><BackLink href="/payments" label="Volver a pagos" /><h1 className="mt-6 text-3xl font-black">{row.student.firstName} {row.student.lastName}</h1><p className="mt-2 text-slate-500">Total: <strong>{formatMoney(due)}</strong>{row.payment.overrideAmountCents !== null && " · ajustado"}</p><div className="mt-8 grid gap-6 lg:grid-cols-2"><form action={updatePayment.bind(null, id)} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="space-y-4"><Field label="Importe cobrado"><Input name="paidAmount" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={(row.payment.paidAmountCents / 100).toFixed(2)} /></Field><Field label="Importe total ajustado (opcional)"><MoneyInput name="overrideAmount" defaultValue={row.payment.overrideAmountCents === null ? "" : (row.payment.overrideAmountCents / 100).toFixed(2)} /></Field><Field label="Motivo del ajuste"><Textarea name="overrideReason" maxLength={500} defaultValue={row.payment.overrideReason ?? ""} /></Field><Field label="Método"><Select name="method" defaultValue={row.payment.method ?? "cash"}><option value="cash">Efectivo</option><option value="bizum">Bizum</option><option value="transfer">Transferencia</option></Select></Field><button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white">Guardar pago</button></div></form><section><h2 className="text-lg font-black">Desglose de clases</h2><div className="mt-3 space-y-2">{lines.map((line) => <div key={line.classId} className="flex justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm"><span>Clase {line.classId.slice(0, 8)}</span><strong>{formatMoney(line.amountCents)}</strong></div>)}</div></section></div></main>;
}
