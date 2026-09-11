export const levelLabels = {
  intro: "Iniciación",
  beginner: "Principiante",
  intermediate: "Medio",
  advanced: "Avanzado",
  competition: "Competición",
} as const;
export const genderLabels = { male: "Hombre", female: "Mujer" } as const;
export const classTypeLabels = {
  individual: "Individual",
  pair: "Pareja",
  group: "Grupo",
} as const;
export const classStatusLabels = {
  pending: "Pendiente",
  completed: "Terminada",
  cancelled: "Cancelada",
} as const;
export const paymentMethodLabels = {
  cash: "Efectivo",
  bizum: "Bizum",
  transfer: "Transferencia",
} as const;

export function paymentStatus(paidCents: number, dueCents: number) {
  if (paidCents >= dueCents) return "completed" as const;
  if (paidCents > 0) return "partial" as const;
  return "pending" as const;
}

export const paymentStatusLabels = {
  pending: "Pendiente",
  partial: "A medias",
  completed: "Completado",
} as const;
