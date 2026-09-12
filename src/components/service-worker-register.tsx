"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silencioso: no es crítico si falla (ej. navegadores sin soporte).
      });
    }
  }, []);

  return null;
}
