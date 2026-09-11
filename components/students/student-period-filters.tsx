"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Select } from "@/components/ui/field";

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
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-70" : ""}`} aria-busy={isPending}>
      <label className="text-xs font-bold text-slate-500">
        Mes
        <Select
          name="month"
          value={String(optimisticPeriod.month)}
          onChange={(event) => update("month", event.target.value)}
        >
          <option value="1">Enero</option>
          <option value="2">Febrero</option>
          <option value="3">Marzo</option>
          <option value="4">Abril</option>
          <option value="5">Mayo</option>
          <option value="6">Junio</option>
          <option value="7">Julio</option>
          <option value="8">Agosto</option>
          <option value="9">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
        </Select>
      </label>
      <label className="text-xs font-bold text-slate-500">
        Año
        <Select
          name="year"
          value={String(optimisticPeriod.year)}
          onChange={(event) => update("year", event.target.value)}
        >
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
