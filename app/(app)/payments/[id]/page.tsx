import Link from "next/link";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { classes, paymentLines, payments, students } from "@/lib/db/schema";
import { updatePayment } from "./actions";
import { BackLink } from "@/components/ui/back-link";
import { Input, Select, Textarea, Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { formatMoney } from "@/lib/format";
import { classTypeLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [[row], lines] = await Promise.all([
    db
      .select({ payment: payments, student: students })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .where(eq(payments.id, id)),
    db
      .select({ line: paymentLines, padelClass: classes })
      .from(paymentLines)
      .innerJoin(classes, eq(paymentLines.classId, classes.id))
      .where(eq(paymentLines.paymentId, id)),
  ]);
  if (!row)
    return (
      <main className="mx-auto max-w-4xl">
        <BackLink href="/payments" label="Volver a pagos" />
        <p className="mt-6">Pago no encontrado.</p>
      </main>
    );
  const due = row.payment.overrideAmountCents ?? row.payment.computedAmountCents;
  return (
    <main className="mx-auto min-h-screen max-w-4xl pb-12">
      <BackLink href="/payments" label="Volver a pagos" />
      <h1 className="mt-6 text-3xl font-black">
        {row.student.firstName} {row.student.lastName}
      </h1>
      <p className="mt-2 text-slate-500">
        Total: <strong>{formatMoney(due)}</strong>
        {row.payment.overrideAmountCents !== null && " · ajustado"}
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form
          action={updatePayment.bind(null, id)}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="space-y-4">
            <Field label="Importe cobrado">
              <Input
                name="paidAmount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={(row.payment.paidAmountCents / 100).toFixed(2)}
              />
            </Field>
            <Field label="Importe total ajustado (opcional)">
              <MoneyInput
                name="overrideAmount"
                defaultValue={
                  row.payment.overrideAmountCents === null
                    ? ""
                    : (row.payment.overrideAmountCents / 100).toFixed(2)
                }
              />
            </Field>
            <Field label="Motivo del ajuste">
              <Textarea
                name="overrideReason"
                maxLength={500}
                defaultValue={row.payment.overrideReason ?? ""}
              />
            </Field>
            <Field label="Método">
              <Select name="method" defaultValue={row.payment.method ?? "cash"}>
                <option value="cash">Efectivo</option>
                <option value="bizum">Bizum</option>
                <option value="transfer">Transferencia</option>
              </Select>
            </Field>
            <button className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white">
              Guardar pago
            </button>
          </div>
        </form>
        <section>
          <h2 className="text-lg font-black">Desglose de clases</h2>
          <div className="mt-3 space-y-2">
            {lines.map(({ line, padelClass }) => (
              <Link
                key={line.classId}
                href={`/classes/${line.classId}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span>
                  <strong>{format(padelClass.startsAt, "d/MM · HH:mm")}</strong>
                  <span className="ml-2 text-slate-500">{classTypeLabels[padelClass.type]}</span>
                </span>
                <strong>{formatMoney(line.amountCents)}</strong>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
