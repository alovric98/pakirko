"use client";

import { useEffect } from "react";

/* Registers the manual service worker (public/sw.js). Production only:
   in dev a SW would cache stale bundles and fight hot reload. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // No offline support, but the app still works online.
    });
  }, []);

  return null;
}
