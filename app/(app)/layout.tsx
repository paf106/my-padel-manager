import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NavLink } from "@/components/ui/nav-link";

const items = [
  ["/", "Inicio", "home"],
  ["/calendar", "Calendario", "calendar"],
  ["/students", "Alumnos", "students"],
  ["/payments", "Pagos", "payments"],
  ["/settings", "Ajustes", "settings"],
] as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = (await headers()).get("x-padel-auth-user");
  if (!userId) redirect("/login");
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-8 lg:flex">
        <Link href="/" className="mb-10 px-3">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Padel Ledger</p>
          <p className="mt-1 text-xs text-slate-400">Gestión de tu pista</p>
        </Link>
        <nav className="space-y-2" aria-label="Navegación principal">
          {items.map(([href, label, Icon]) => <NavLink key={href} href={href} label={label} icon={Icon} variant="sidebar" />)}
        </nav>
      </aside>
      <div className="mx-auto max-w-7xl px-4 pb-[calc(var(--bottom-nav-h)+5rem)] pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-[#f6f7f2]/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden" aria-label="Navegación principal">
        {items.slice(0, 4).map(([href, label, Icon]) => <NavLink key={href} href={href} label={label} icon={Icon} variant="bottom" />)}
      </nav>
    </div>
  );
}
