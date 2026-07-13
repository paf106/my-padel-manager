import { Users, Wallet } from "lucide-react";

import {
  listPaymentsForPeriod,
  paymentTotalsForPeriod,
} from "@/lib/db/queries";
import { formatCurrency, monthName } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentRow } from "./payment-row";
import { PeriodSelector } from "./period-selector";

export const dynamic = "force-dynamic";

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { year: yParam, month: mParam } = await searchParams;
  const now = new Date();
  const year = clampInt(yParam, now.getFullYear(), 1970, 3000);
  const month = clampInt(mParam, now.getMonth() + 1, 1, 12);

  const [rows, totals] = await Promise.all([
    listPaymentsForPeriod(year, month),
    paymentTotalsForPeriod(year, month),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos"
        description={
          <span className="capitalize">
            {monthName(month)} {year}
          </span>
        }
        action={<PeriodSelector year={year} month={month} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="size-4" /> Cobrado
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-600">
              {formatCurrency(totals.collected)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="size-4" /> Pendiente
            </CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {formatCurrency(totals.pending)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="size-4" /> Total previsto
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(totals.total)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay alumnos"
          description="Añade alumnos para poder registrar sus pagos."
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <PaymentRow
                  key={row.studentId}
                  row={row}
                  year={year}
                  month={month}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Escribe el importe y sal del campo para guardarlo. El pago se registra
        automáticamente para el periodo seleccionado.
      </p>
    </div>
  );
}

function clampInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const n = value ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n) || n < min || n > max) return fallback;
  return n;
}
