"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center">
      <h1 className="text-xl font-black">No se pudo cargar esta página</h1>
      <p className="mt-2 text-sm text-slate-500">Comprueba la conexión e inténtalo de nuevo.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
