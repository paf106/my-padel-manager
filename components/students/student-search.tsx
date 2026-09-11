"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export function StudentSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const lastInitialQuery = useRef(initialQuery);
  const syncingFromUrl = useRef(false);

  useEffect(() => {
    if (lastInitialQuery.current === initialQuery) return;
    lastInitialQuery.current = initialQuery;
    syncingFromUrl.current = true;
    const timeout = window.setTimeout(() => {
      setQuery(initialQuery);
      syncingFromUrl.current = false;
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [initialQuery]);

  useEffect(() => {
    if (lastInitialQuery.current !== initialQuery || syncingFromUrl.current) return;
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
      if (nextUrl !== `${pathname}${window.location.search}`) {
        startTransition(() => router.replace(nextUrl, { scroll: false }));
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [initialQuery, pathname, query, router]);

  return (
    <label className="relative block w-full max-w-xxl">
      <span className="sr-only">Buscar alumnos por nombre o teléfono</span>
      <Search
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nombre o teléfono"
        aria-label="Buscar alumnos por nombre o teléfono"
        aria-busy={isPending}
        className={`h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 ${isPending ? "opacity-70" : ""}`}
      />
      <span className="sr-only" aria-live="polite">
        {isPending ? "Buscando alumnos..." : ""}
      </span>
    </label>
  );
}
