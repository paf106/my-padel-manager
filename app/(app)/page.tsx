import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Users,
  Volleyball,
  Wallet,
} from "lucide-react";

import {
  countClasses,
  countStudents,
  listUpcomingClasses,
  paymentTotals,
} from "@/lib/db/queries";
import {
  CLASS_STATUS_BADGE,
  CLASS_STATUS_LABELS,
  CLASS_TYPE_LABELS,
} from "@/lib/labels";
import { formatCurrency, formatDateTime, fullName } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {

  const [studentsCount, classesCount, upcoming, totals] = await Promise.all([
    countStudents(),
    countClasses(),
    listUpcomingClasses(6),
    paymentTotals(),
  ]);

  const stats = [
    {
      label: "Alumnos",
      value: String(studentsCount),
      icon: Users,
      href: "/students",
    },
    {
      label: "Clases",
      value: String(classesCount),
      icon: Volleyball,
      href: "/classes",
    },
    {
      label: "Cobrado",
      value: formatCurrency(totals.collected),
      icon: Wallet,
      href: "/payments",
      className: "text-emerald-600",
    },
    {
      label: "Pendiente",
      value: formatCurrency(totals.pending),
      icon: Wallet,
      href: "/payments",
      className: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inicio"
        description="Resumen de tu actividad."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:bg-accent/40">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 capitalize">
                  <s.icon className="size-4" /> {s.label}
                </CardDescription>
                <CardTitle className={`text-2xl ${s.className ?? ""}`}>
                  {s.value}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5" /> Próximas clases
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/calendar">
              Ver calendario <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No hay clases próximas"
              description="Cuando programes clases futuras aparecerán aquí."
            />
          ) : (
            <ul className="divide-y">
              {upcoming.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/classes/${c.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {c.students.length
                          ? c.students.map((s) => fullName(s)).join(", ")
                          : CLASS_TYPE_LABELS[c.type]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(c.startsAt)} · {CLASS_TYPE_LABELS[c.type]}
                      </p>
                    </div>
                    <Badge variant={CLASS_STATUS_BADGE[c.status]}>
                      {CLASS_STATUS_LABELS[c.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
