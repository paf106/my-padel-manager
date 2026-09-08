const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatMoney(cents: number) {
  return euro.format(cents / 100);
}
