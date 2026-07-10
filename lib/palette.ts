export const PALETTE_COLORS = [
  "sand",
  "peach",
  "sky",
  "lavender",
  "mint",
] as const;

export type PaletteColor = (typeof PALETTE_COLORS)[number];

/* Tailwind cannot build class names at runtime, so palette keys map to
   static classes. Values follow the CSS variables in app/globals.css. */
export const PALETTE_BG_CLASS: Record<PaletteColor, string> = {
  sand: "bg-card-sand",
  peach: "bg-card-peach",
  sky: "bg-card-sky",
  lavender: "bg-card-lavender",
  mint: "bg-card-mint",
};

/* Croatian labels for the color picker UI (Phase 2). */
export const PALETTE_LABELS: Record<PaletteColor, string> = {
  sand: "Pijesak",
  peach: "Breskva",
  sky: "Plava",
  lavender: "Lavanda",
  mint: "Mint",
};
