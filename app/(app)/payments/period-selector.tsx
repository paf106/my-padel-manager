"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { monthName } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PeriodSelector({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const router = useRouter();

  const go = (y: number, m: number) =>
    router.push(`/payments?year=${y}&month=${m}`);

  const prev = () => {
    const d = new Date(year, month - 2, 1);
    go(d.getFullYear(), d.getMonth() + 1);
  };
  const next = () => {
    const d = new Date(year, month, 1);
    go(d.getFullYear(), d.getMonth() + 1);
  };

  const years = Array.from({ length: 7 }, (_, i) => year - 3 + i);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="icon" onClick={prev} aria-label="Mes anterior">
        <ChevronLeft className="size-4" />
      </Button>

      <Select value={String(month)} onValueChange={(v) => go(year, Number(v))}>
        <SelectTrigger className="w-32 capitalize sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <SelectItem key={m} value={String(m)} className="capitalize">
              {monthName(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(year)} onValueChange={(v) => go(Number(v), month)}>
        <SelectTrigger className="w-24 sm:w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={next} aria-label="Mes siguiente">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
