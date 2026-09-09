import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Fab({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return <Link href={href} aria-label={label} className="fixed bottom-[calc(var(--bottom-nav-h)+1rem)] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/25 transition hover:bg-emerald-700 lg:hidden"><Icon size={25} /></Link>;
}
