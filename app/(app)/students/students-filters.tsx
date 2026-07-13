"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { LEVEL_OPTIONS } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

export function StudentsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  // Debounce the search -> URL.
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("q", search);
      else params.delete("q");
      router.replace(`/students?${params.toString()}`);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const level = searchParams.get("level") ?? ALL;

  const onLevelChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) params.set("level", value);
    else params.delete("level");
    router.replace(`/students?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o apellidos…"
          className="pl-9"
        />
      </div>
      <Select value={level} onValueChange={onLevelChange}>
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="Todos los niveles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los niveles</SelectItem>
          {LEVEL_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
