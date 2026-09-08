import Link from "next/link";
import { CalendarDays, CircleDollarSign, CreditCard, Plus, Settings, Users } from "lucide-react";

const items = [
  ["/", "Inicio", CircleDollarSign],
  ["/calendar", "Calendario", CalendarDays],
  ["/students", "Alumnos", Users],
  ["/payments", "Pagos", CreditCard],
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen lg:pl-64"><aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-8 lg:flex"><Link href="/" className="mb-10 px-3"><p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Padel Ledger</p><p className="mt-1 text-xs text-slate-400">Gestión de tu pista</p></Link><nav className="space-y-2" aria-label="Navegación principal">{items.map(([href, label, Icon]) => <Link key={href} href={href} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800"><Icon size={20} /><span>{label}</span></Link>)}<Link href="/settings" className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800"><Settings size={20} /><span>Ajustes</span></Link></nav><Link href="/classes/new" className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 font-bold text-white"><Plus size={20} /> Nueva clase</Link></aside><div className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10">{children}</div><nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-[#f6f7f2]/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden" aria-label="Navegación principal">{items.map(([href, label, Icon]) => <Link key={href} href={href} className="flex min-h-11 flex-1 flex-col items-center gap-1 text-xs font-bold text-slate-500"><Icon size={21} /><span>{label}</span></Link>)}<Link href="/classes/new" aria-label="Nueva clase" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20"><Plus size={25} /></Link></nav></div>;
}
