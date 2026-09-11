"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const defer = () => window.setTimeout(register, 0);
    if (document.readyState === "complete") {
      const timer = defer();
      return () => window.clearTimeout(timer);
    }
    window.addEventListener("load", defer, { once: true });
    return () => window.removeEventListener("load", defer);
  }, []);
  return null;
}
