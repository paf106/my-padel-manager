import Link from "next/link";
import { ChevronLeft, ChevronRight, Users, Wallet } from "lucide-react";
import { buildMonthlyDraft } from "@/lib/billing";
import { listCompletedClassesForMonth, listPayments, paymentTotals } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentRow } from "./payment-row";
import { PaymentFormDialog } from "./payment-form-dialog";

export const dynamic = "force-dynamic";

function validInt(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

export default async function PagosPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const now = new Date();
  const year = validInt((await searchParams).year, now.getFullYear(), 1970, 3000);
  const month = validInt((await searchParams).month, now.getMonth() + 1, 1, 12);
  const [completedClasses, rows, totals] = await Promise.all([listCompletedClassesForMonth(year, month), listPayments(year, month), paymentTotals(year, month)]);
  const drafts = buildMonthlyDraft(completedClasses);
  const previous = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const monthLabel = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));

  return <div className="space-y-6">
    <PageHeader title="Pagos mensuales" description="Revisa y genera el importe de cada alumno a partir de sus clases completadas." action={<PaymentFormDialog year={year} month={month} drafts={drafts} existingStudentIds={rows.map((row) => row.student.id)} />} />
    <div className="flex items-center justify-between rounded-xl border bg-card p-2"><Button variant="ghost" size="sm" asChild><Link href={`/payments?year=${previous.getFullYear()}&month=${previous.getMonth() + 1}`}><ChevronLeft className="size-4" /> Anterior</Link></Button><span className="font-semibold capitalize">{monthLabel}</span><Button variant="ghost" size="sm" asChild><Link href={`/payments?year=${next.getFullYear()}&month=${next.getMonth() + 1}`}>Siguiente <ChevronRight className="size-4" /></Link></Button></div>
    <div className="grid gap-4 sm:grid-cols-3"><Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Wallet className="size-4" /> Cobrado</CardDescription><CardTitle className="text-2xl tabular-nums text-emerald-600">{formatCurrency(totals.collected)}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Wallet className="size-4" /> Pendiente</CardDescription><CardTitle className="text-2xl tabular-nums text-amber-600">{formatCurrency(totals.pending)}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Wallet className="size-4" /> Total del mes</CardDescription><CardTitle className="text-2xl tabular-nums">{formatCurrency(totals.total)}</CardTitle></CardHeader></Card></div>
    {rows.length === 0 ? <EmptyState icon={Users} title="No hay pagos para este mes" description="Genera los pagos después de revisar el desglose de las clases completadas." action={<PaymentFormDialog year={year} month={month} drafts={drafts} existingStudentIds={[]} />} /> : <div className="overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>Alumno</TableHead><TableHead className="hidden md:table-cell">Clases</TableHead><TableHead className="text-right">Importe</TableHead><TableHead>Estado</TableHead><TableHead className="hidden sm:table-cell">Fecha de pago</TableHead><TableHead /></TableRow></TableHeader><TableBody>{rows.map((row) => <PaymentRow key={row.id} row={row} freshDraft={drafts.find((draft) => draft.studentId === row.student.id)} />)}</TableBody></Table></div>}
  </div>;
}
