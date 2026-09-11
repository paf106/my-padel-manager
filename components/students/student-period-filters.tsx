"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { SelectPill } from "@/components/ui/select-pill";

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function StudentPeriodFilters({
  year,
  month,
  years,
}: {
  year: number;
  month: number;
  years: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [optimisticPeriod, setOptimisticPeriod] = useOptimistic({ year, month });
  function update(name: "year" | "month", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const nextPeriod = { ...optimisticPeriod, [name]: Number(value) };
    params.set("year", String(nextPeriod.year));
    params.set("month", String(nextPeriod.month));
    startTransition(() => {
      setOptimisticPeriod(nextPeriod);
      router.replace(`${pathname}?${params}`, { scroll: false });
    });
  }
  return (
    <div className={`flex flex-wrap gap-2 ${isPending ? "opacity-70" : ""}`} aria-busy={isPending}>
      <SelectPill
        label="Mes"
        value={String(optimisticPeriod.month)}
        onChange={(event) => update("month", event.target.value)}
        className="min-w-[11rem]"
      >
        {months.map((name, index) => (
          <option key={index + 1} value={index + 1}>
            {name}
          </option>
        ))}
      </SelectPill>
      <SelectPill
        label="Año"
        value={String(optimisticPeriod.year)}
        onChange={(event) => update("year", event.target.value)}
        className="min-w-[8.5rem]"
      >
        {Array.from(new Set([...years, optimisticPeriod.year]))
          .sort((a, b) => b - a)
          .map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
      </SelectPill>
    </div>
  );
}
