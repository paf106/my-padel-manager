"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const RevenueChartPlot = lazy(() => import("./revenue-chart-plot"));

export function RevenueChart({ data }: { data: { label: string; amount: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} aria-label="Gráfico de ingresos" role="img">
      <div className="h-48 w-full">
        {visible ? (
          <Suspense fallback={<Skeleton tone="dark" className="h-full rounded-xl" />}>
            <RevenueChartPlot data={data} />
          </Suspense>
        ) : (
          <div className="h-full" aria-hidden="true" />
        )}
      </div>
      <table className="sr-only">
        <caption>Ingresos por periodo</caption>
        <thead>
          <tr>
            <th scope="col">Periodo</th>
            <th scope="col">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{item.amount.toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
