import type { PaletteColor } from "./palette";

export const SCHEMA_VERSION = 1;

export type Theme = "light" | "dark";

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  theme: Theme;
  lists: PackingList[];
}

export interface PackingList {
  id: string; // uuid (crypto.randomUUID)
  name: string;
  emoji: string;
  color: PaletteColor; // palette key, never a raw hex value
  tripDate: string | null; // ISO date, optional
  createdAt: string;
  groups: Group[];
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  color: PaletteColor;
  items: Item[]; // array order = display order
}

export interface Item {
  id: string;
  text: string;
  done: boolean; // "Spremno"
  quantityEnabled: boolean; // per-item option, default off
  quantity: number; // default 1, shown only while quantityEnabled
}
