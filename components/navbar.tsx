"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Users,
  Volleyball,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/classes", label: "Clases", icon: Volleyball },
  { href: "/students", label: "Alumnos", icon: Users },
  { href: "/payments", label: "Pagos", icon: Wallet },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2 font-semibold"
        >
          <Volleyball className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">My Padel Manager</span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden flex-1 items-center gap-1 sm:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <form action="/api/auth/logout" method="post" className="ml-auto sm:ml-0">
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="inline-flex size-11 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto sm:px-3"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </div>
    </header>
  );
}
