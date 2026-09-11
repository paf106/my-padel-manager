"use client";

import { useTransition } from "react";
import { signOut } from "@/app/(app)/settings/logout-actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  function clearClientState() {
    startTransition(async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ("caches" in window)
          await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
      } finally {
        await signOut();
      }
    });
  }
  return (
    <button
      type="button"
      onClick={clearClientState}
      disabled={pending}
      className="min-h-12 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700 disabled:opacity-60"
    >
      {pending ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
