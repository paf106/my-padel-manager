export default function AppLoading() {
  return (
    <main className="mx-auto max-w-5xl" aria-busy="true" aria-label="Cargando página">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 space-y-4">
        <div className="h-28 animate-pulse rounded-2xl bg-white" />
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
      </div>
    </main>
  );
}
