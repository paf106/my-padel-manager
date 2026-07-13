import Link from "next/link";
import { Users } from "lucide-react";

import {
  classCountByStudent,
  listStudents,
} from "@/lib/db/queries";
import type { Level } from "@/lib/db/schema";
import { GENDER_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { ageFromBirthDate, fullName } from "@/lib/format";
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
import { StudentFormDialog } from "./student-form-dialog";
import { StudentsFilters } from "./students-filters";

export const dynamic = "force-dynamic";

const LEVEL_VALUES = ["beginner_intro", "beginner", "intermediate", "advanced"];

export default async function AlumnosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string }>;
}) {
  const { q, level } = await searchParams;
  const validLevel = level && LEVEL_VALUES.includes(level) ? (level as Level) : undefined;

  const [rows, classCounts] = await Promise.all([
    listStudents({ search: q, level: validLevel }),
    classCountByStudent(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumnos"
        description="Gestiona la información de tus alumnos."
        action={<StudentFormDialog />}
      />

      <StudentsFilters />

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay alumnos"
          description={
            q || validLevel
              ? "No se han encontrado alumnos con esos filtros."
              : "Empieza añadiendo tu primer alumno."
          }
          action={!q && !validLevel ? <StudentFormDialog /> : undefined}
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead className="hidden sm:table-cell">Sexo</TableHead>
                <TableHead className="hidden md:table-cell">Edad</TableHead>
                <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                <TableHead className="text-right">Clases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const age = ageFromBirthDate(s.birthDate);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/students/${s.id}`}
                        className="hover:underline"
                      >
                        {fullName(s)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{LEVEL_LABELS[s.level]}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {s.gender ? GENDER_LABELS[s.gender] : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {age != null ? `${age} años` : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {s.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {classCounts.get(s.id) ?? 0}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
