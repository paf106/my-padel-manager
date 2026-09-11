const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatMoney(cents: number) {
  return euro.format(cents / 100);
}

export function shortStudentName(firstName: string, lastName: string) {
  const initial = lastName.trim().charAt(0);
  return initial ? `${firstName} ${initial}.` : firstName;
}
