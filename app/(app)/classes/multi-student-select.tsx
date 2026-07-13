"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { fullName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
};

export function MultiStudentSelect({
  options,
  defaultSelectedIds = [],
}: {
  options: StudentOption[];
  defaultSelectedIds?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelectedIds);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const byId = useMemo(
    () => new Map(options.map((o) => [o.id, o])),
    [options]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => fullName(o).toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="space-y-2">
      {/* Hidden inputs for form submission */}
      {selected.map((id) => (
        <input key={id} type="hidden" name="studentIds" value={id} />
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="text-muted-foreground">
              {selected.length
                ? `${selected.length} alumno${selected.length > 1 ? "s" : ""} seleccionado${selected.length > 1 ? "s" : ""}`
                : "Selecciona alumnos…"}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <div className="border-b p-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alumno…"
              className="h-8"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                Sin resultados.
              </p>
            ) : (
              filtered.map((o) => {
                const isSelected = selected.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggle(o.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      )}
                    >
                      {isSelected ? <Check className="size-3" /> : null}
                    </span>
                    {fullName(o)}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const o = byId.get(id);
            if (!o) return null;
            return (
              <Badge key={id} variant="secondary" className="gap-1 pr-1">
                {fullName(o)}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="rounded-full hover:bg-background/60"
                  aria-label={`Quitar ${fullName(o)}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
