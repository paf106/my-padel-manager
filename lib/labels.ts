import type {
  ClassStatus,
  ClassType,
  Gender,
  Level,
} from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Map value (English, stored in DB) -> label (Spanish, shown in the UI)
// ---------------------------------------------------------------------------

export const LEVEL_LABELS: Record<Level, string> = {
  beginner_intro: "Iniciación",
  beginner: "Principiante",
  intermediate: "Medio",
  advanced: "Avanzado",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Hombre",
  female: "Mujer",
  other: "Otro",
};

export const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  individual: "Individual",
  pair: "Pareja",
  group: "Grupo",
};

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  pending: "Pendiente",
  cancelled: "Cancelada",
  completed: "Terminada",
};

// shadcn badge variant per class status.
export const CLASS_STATUS_BADGE: Record<
  ClassStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  cancelled: "destructive",
  completed: "default",
};

// Background color for the calendar based on status.
export const CLASS_STATUS_COLOR: Record<ClassStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  cancelled: "bg-red-500/15 text-red-700 border-red-500/30 line-through",
  completed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
};

// ---------------------------------------------------------------------------
// Options for <Select> (value + label)
// ---------------------------------------------------------------------------

type Option<T extends string> = { value: T; label: string };

function toOptions<T extends string>(map: Record<T, string>): Option<T>[] {
  return (Object.entries(map) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));
}

export const LEVEL_OPTIONS = toOptions(LEVEL_LABELS);
export const GENDER_OPTIONS = toOptions(GENDER_LABELS);
export const CLASS_TYPE_OPTIONS = toOptions(CLASS_TYPE_LABELS);
export const CLASS_STATUS_OPTIONS = toOptions(CLASS_STATUS_LABELS);
