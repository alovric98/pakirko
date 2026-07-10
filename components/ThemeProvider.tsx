"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getTheme, setTheme as persistTheme } from "@/lib/storage";
import type { Theme } from "@/lib/types";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* Theme lives in localStorage (owned by the storage layer);
   useSyncExternalStore bridges it into React without hydration mismatches:
   the server snapshot is "light", while the inline script in layout.tsx has
   already applied the persisted theme class before first paint. */
let listeners: ReadonlyArray<() => void> = [];

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

function getServerTheme(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    emit();
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
