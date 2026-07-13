"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Uključi svijetli način" : "Uključi tamni način"}
      className="bg-foreground/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
