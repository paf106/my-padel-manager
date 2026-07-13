import Link from "next/link";
import { Volleyball } from "lucide-react";

import { listClasses, listStudentsBasic } from "@/lib/db/queries";
import type { ClassStatus, ClassType } from "@/lib/db/schema";
import {
  CLASS_STATUS_BADGE,
  CLASS_STATUS_LABELS,
  CLASS_TYPE_LABELS,
} from "@/lib/labels";
import {
  classProfit,
  formatCurrency,
  formatDateTime,
  fullName,
} from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassFormDialog } from "./class-form-dialog";
import { ClassesFilters } from "./classes-filters";

export const dynamic = "force-dynamic";

const STATUS_VALUES = ["pending", "cancelled", "completed"];
const TYPE_VALUES = ["individual", "pair", "group"];

export default async function ClasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { status, type } = await searchParams;
  const validStatus =
    status && STATUS_VALUES.includes(status) ? (status as ClassStatus) : undefined;
  const validType =
    type && TYPE_VALUES.includes(type) ? (type as ClassType) : undefined;

  const [rows, students] = await Promise.all([
    listClasses({ status: validStatus, type: validType }),
    listStudentsBasic(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clases"
        description="Todas tus clases particulares."
        action={<ClassFormDialog students={students} />}
      />

      <ClassesFilters />

      {rows.length === 0 ? (
        <EmptyState
          icon={Volleyball}
          title="No hay clases"
          description={
            validStatus || validType
              ? "No se han encontrado clases con esos filtros."
              : "Empieza registrando tu primera clase."
          }
          action={
            !validStatus && !validType ? (
              <ClassFormDialog students={students} />
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y hora</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Alumnos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="hidden lg:table-cell text-right">
                  Beneficio
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/classes/${c.id}`} className="hover:underline">
                      {formatDateTime(c.startsAt)}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {CLASS_TYPE_LABELS[c.type]}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-56 truncate text-muted-foreground">
                    {c.students.length
                      ? c.students.map((s) => fullName(s)).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CLASS_STATUS_BADGE[c.status]}>
                      {CLASS_STATUS_LABELS[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(c.classPrice)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right tabular-nums">
                    {formatCurrency(classProfit(c))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
