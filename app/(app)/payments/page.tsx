import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, students } from "@/lib/db/schema";
import { generateMonthlyPayments } from "./actions";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { paymentMethodLabels, paymentStatus, paymentStatusLabels } from "@/lib/labels";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deletePayment } from "./actions";
import { madridMonthKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const period = madridMonthKey();
  const rows = await db.select({ payment: payments, student: students }).from(payments).innerJoin(students, eq(payments.studentId, students.id)).where(eq(payments.period, `${period}-01`)).orderBy(asc(students.lastName));
  return <main className="mx-auto min-h-screen max-w-5xl pb-28 lg:pb-4"><PageHeader title="Pagos" eyebrow="Finanzas" /><div className="mt-6 flex items-center justify-between rounded-2xl bg-emerald-900 p-5 text-white"><div><p className="text-sm text-emerald-200">Periodo actual</p><p className="mt-1 text-xl font-black">{period}</p></div><form action={generateMonthlyPayments.bind(null, period)}><button className="min-h-11 rounded-xl bg-white px-4 text-sm font-bold text-emerald-900">Generar pagos</button></form></div>{rows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No hay pagos generados para este mes.</div> : <><div className="mt-6 space-y-3 lg:hidden">{rows.map(({ payment, student }) => <PaymentCard key={payment.id} payment={payment} student={student} />)}</div><div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Alumno</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Cobrado</th><th className="px-5 py-4">Pendiente</th><th className="px-5 py-4">Método</th><th className="px-5 py-4">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(({ payment, student }) => { const due = payment.overrideAmountCents ?? payment.computedAmountCents; const status = paymentStatus(payment.paidAmountCents, due); return <tr key={payment.id} className="hover:bg-emerald-50"><td className="px-5 py-4 font-bold"><Link href={`/payments/${payment.id}`}>{student.firstName} {student.lastName}</Link></td><td className="px-5 py-4">{formatMoney(due)}</td><td className="px-5 py-4">{formatMoney(payment.paidAmountCents)}</td><td className="px-5 py-4">{formatMoney(Math.max(0, due - payment.paidAmountCents))}</td><td className="px-5 py-4">{payment.method ? paymentMethodLabels[payment.method] : "-"}</td><td className="px-5 py-4"><Badge tone={status === "completed" ? "success" : status === "partial" ? "warning" : "danger"}>{paymentStatusLabels[status]}</Badge></td></tr>; })}</tbody></table></div></>}</main>;
}

function PaymentCard({ payment, student }: { payment: typeof payments.$inferSelect; student: typeof students.$inferSelect }) { const due = payment.overrideAmountCents ?? payment.computedAmountCents; const status = paymentStatus(payment.paidAmountCents, due); return <div className="rounded-2xl border border-slate-200 bg-white p-4"><Link href={`/payments/${payment.id}`} className="block"><div className="flex items-center justify-between"><p className="font-black">{student.firstName} {student.lastName}</p><Badge tone={status === "completed" ? "success" : status === "partial" ? "warning" : "danger"}>{paymentStatusLabels[status]}</Badge></div><div className="mt-3 flex justify-between text-sm text-slate-500"><span>{formatMoney(payment.paidAmountCents)} de {formatMoney(due)}</span><span>{payment.method ? paymentMethodLabels[payment.method] : "Sin método"}</span></div></Link><div className="mt-3"><ConfirmButton label="Eliminar pago" confirmLabel="El pago y su desglose se eliminarán definitivamente."><form action={deletePayment.bind(null, payment.id)}><button className="text-sm font-bold text-red-700">Eliminar pago</button></form></ConfirmButton></div></div>; }
