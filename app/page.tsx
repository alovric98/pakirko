"use client";

import { useTheme } from "@/components/ThemeProvider";
import {
  PALETTE_BG_CLASS,
  PALETTE_COLORS,
  PALETTE_LABELS,
} from "@/lib/palette";

/* TEMPORARY Phase 1 demo page — verifies theme, palette and storage wiring.
   Replaced by the real home screen (list cards) in Phase 2. */
export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pakirko 🧳</h1>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium"
        >
          {theme === "dark" ? "☀️ Svijetla" : "🌙 Tamna"}
        </button>
      </header>

      <p className="text-foreground/70">
        Faza 1: setup projekta, tema i storage sloj. Ova stranica je privremena
        — home screen s karticama popisa stiže u Fazi 2.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">
          Paleta
        </h2>
        {PALETTE_COLORS.map((color) => (
          <div
            key={color}
            className={`${PALETTE_BG_CLASS[color]} rounded-card px-5 py-4 font-medium`}
          >
            {PALETTE_LABELS[color]}
          </div>
        ))}
      </section>
    </main>
  );
}
