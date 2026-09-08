import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, students } from "@/lib/db/schema";
import { generateMonthlyPayments } from "./actions";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const period = new Date().toISOString().slice(0, 7);
  const rows = await db.select({ payment: payments, student: students }).from(payments).innerJoin(students, eq(payments.studentId, students.id)).where(eq(payments.period, `${period}-01`)).orderBy(asc(students.lastName));
  return <main className="mx-auto min-h-screen max-w-2xl px-5 pb-28 pt-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Finanzas</p><h1 className="mt-2 text-3xl font-black">Pagos</h1><div className="mt-6 flex items-center justify-between rounded-2xl bg-emerald-900 p-5 text-white"><div><p className="text-sm text-emerald-200">Periodo actual</p><p className="mt-1 text-xl font-black">{period}</p></div><form action={generateMonthlyPayments.bind(null, period)}><button className="min-h-11 rounded-xl bg-white px-4 text-sm font-bold text-emerald-900">Generar pagos</button></form></div>{rows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No hay pagos generados para este mes.</div> : <div className="mt-6 space-y-3">{rows.map(({ payment, student }) => <article key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="font-black">{student.firstName} {student.lastName}</p><span className="text-lg font-black">{(payment.computedAmountCents / 100).toFixed(2)} €</span></div><p className="mt-2 text-sm text-slate-500">Pagado: {(payment.paidAmountCents / 100).toFixed(2)} €</p></article>)}</div>}</main>;
}
