import Link from "next/link";
import { CalendarDays, CircleDollarSign, CreditCard, Plus, Users } from "lucide-react";

const items = [
  ["/", "Inicio", CircleDollarSign],
  ["/calendar", "Calendario", CalendarDays],
  ["/students", "Alumnos", Users],
  ["/payments", "Pagos", CreditCard],
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}<nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-2xl justify-around border-t border-slate-200 bg-[#f6f7f2]/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur" aria-label="Navegación principal">{items.map(([href, label, Icon]) => <Link key={href} href={href} className="flex min-h-11 flex-1 flex-col items-center gap-1 text-xs font-bold text-slate-500"><Icon size={21} /><span>{label}</span></Link>)}<Link href="/classes/new" aria-label="Nueva clase" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20"><Plus size={25} /></Link></nav></div>;
}
