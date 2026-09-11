export default function PaymentsLoading() {
  return (
    <div className="space-y-4" aria-label="Cargando pagos">
      <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-96 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
