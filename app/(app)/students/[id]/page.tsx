import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Phone, Wallet } from "lucide-react";

import {
  getStudent,
  getStudentClasses,
  getStudentPayments,
} from "@/lib/db/queries";
import {
  CLASS_STATUS_BADGE,
  CLASS_STATUS_LABELS,
  CLASS_TYPE_LABELS,
  GENDER_LABELS,
  LEVEL_LABELS,
} from "@/lib/labels";
import {
  ageFromBirthDate,
  classProfit,
  classTotal,
  formatCurrency,
  formatDate,
  formatDateTime,
  fullName,
  toNumber,
} from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteStudentButton } from "../delete-student-button";
import { StudentFormDialog } from "../student-form-dialog";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const [classesList, paymentsList] = await Promise.all([
    getStudentClasses(id),
    getStudentPayments(id),
  ]);

  const age = ageFromBirthDate(student.birthDate);
  const totalPaid = paymentsList
    .filter((p) => p.paid)
    .reduce((acc, p) => acc + toNumber(p.amount), 0);
  const totalPending = paymentsList
    .filter((p) => !p.paid)
    .reduce((acc, p) => acc + toNumber(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/students">
            <ArrowLeft className="size-4" /> Volver
          </Link>
        </Button>
        <div className="flex gap-2">
          <StudentFormDialog student={student} />
          <DeleteStudentButton id={student.id} name={fullName(student)} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {fullName(student)}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{LEVEL_LABELS[student.level]}</Badge>
          {student.gender ? <span>{GENDER_LABELS[student.gender]}</span> : null}
          {age != null ? <span>· {age} años</span> : null}
          {student.phone ? (
            <span className="inline-flex items-center gap-1">
              · <Phone className="size-3" /> {student.phone}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> Clases
            </CardDescription>
            <CardTitle className="text-2xl">{classesList.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="size-4" /> Cobrado
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-600">
              {formatCurrency(totalPaid)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="size-4" /> Pendiente
            </CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {formatCurrency(totalPending)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Birth date */}
      {student.birthDate ? (
        <p className="text-sm text-muted-foreground">
          Fecha de nacimiento: {formatDate(student.birthDate)}
        </p>
      ) : null}

      {/* Class history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de clases</CardTitle>
        </CardHeader>
        <CardContent>
          {classesList.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sin clases"
              description="Este alumno todavía no tiene clases registradas."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">
                    Beneficio
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classesList.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        href={`/classes/${c.id}`}
                        className="hover:underline"
                      >
                        {formatDateTime(c.startsAt)}
                      </Link>
                    </TableCell>
                    <TableCell>{CLASS_TYPE_LABELS[c.type]}</TableCell>
                    <TableCell>
                      <Badge variant={CLASS_STATUS_BADGE[c.status]}>
                        {CLASS_STATUS_LABELS[c.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(classTotal(c))}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right tabular-nums">
                      {formatCurrency(classProfit(c))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Pagos</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/payments">Gestionar pagos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {paymentsList.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Sin pagos"
              description="No hay pagos registrados para este alumno."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Fecha de pago
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsList.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="capitalize">
                      {formatDate(p.period)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell>
                      {p.paid ? (
                        <Badge>Pagado</Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(p.paidAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
