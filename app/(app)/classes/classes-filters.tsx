"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { CLASS_STATUS_OPTIONS, CLASS_TYPE_OPTIONS } from "@/lib/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

export function ClassesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? ALL;
  const type = searchParams.get("type") ?? ALL;

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) params.set(key, value);
    else params.delete(key);
    router.replace(`/classes?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select value={status} onValueChange={(v) => setParam("status", v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los estados</SelectItem>
          {CLASS_STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={(v) => setParam("type", v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Todos los tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los tipos</SelectItem>
          {CLASS_TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
