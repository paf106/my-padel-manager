import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users } from "lucide-react";

import { getClass, listStudentsBasic } from "@/lib/db/queries";
import {
  CLASS_STATUS_BADGE,
  CLASS_STATUS_LABELS,
  CLASS_TYPE_LABELS,
} from "@/lib/labels";
import {
  classProfit,
  classTotal,
  formatCurrency,
  formatDateTime,
  fullName,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClassFormDialog } from "../class-form-dialog";
import { DeleteClassButton } from "../delete-class-button";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cls, students] = await Promise.all([
    getClass(id),
    listStudentsBasic(),
  ]);
  if (!cls) notFound();

  const profit = classProfit(cls);
  const total = classTotal(cls);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/classes">
            <ArrowLeft className="size-4" /> Volver
          </Link>
        </Button>
        <div className="flex gap-2">
          <ClassFormDialog students={students} cls={cls} />
          <DeleteClassButton id={cls.id} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Clase {CLASS_TYPE_LABELS[cls.type].toLowerCase()}
          </h1>
          <Badge variant={CLASS_STATUS_BADGE[cls.status]}>
            {CLASS_STATUS_LABELS[cls.status]}
          </Badge>
        </div>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-4" />
          {formatDateTime(cls.startsAt)} · {cls.durationMin} min
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Precio pista</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(cls.courtPrice)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total alumno</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(total)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Beneficio profesor</CardDescription>
            <CardTitle
              className={
                profit >= 0
                  ? "text-2xl text-emerald-600"
                  : "text-2xl text-destructive"
              }
            >
              {formatCurrency(profit)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5" /> Alumnos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cls.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay alumnos asignados a esta clase.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {cls.students.map((s) => (
                <li key={s.id}>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/students/${s.id}`}>{fullName(s)}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {cls.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comentario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {cls.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
