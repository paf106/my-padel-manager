export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}
