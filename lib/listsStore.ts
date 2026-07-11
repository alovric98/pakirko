import { loadState } from "./storage";
import type { PackingList } from "./types";

/* Lists live in localStorage; useSyncExternalStore bridges them into React
   without hydration mismatches (server has no localStorage, so the server
   snapshot is always empty). The snapshot is cached so repeated calls
   return the same reference until invalidateListsCache() runs, as required
   by useSyncExternalStore. Shared by every screen that reads or mutates
   lists so a change made on one screen is reflected on the next. */
const EMPTY_LISTS: PackingList[] = [];
let cachedLists: PackingList[] | null = null;
let listeners: ReadonlyArray<() => void> = [];

export function getListsSnapshot(): PackingList[] {
  if (cachedLists === null) cachedLists = loadState().lists;
  return cachedLists;
}

export function getServerListsSnapshot(): PackingList[] {
  return EMPTY_LISTS;
}

export function subscribeToLists(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function invalidateListsCache(): void {
  cachedLists = null;
  for (const listener of listeners) listener();
}
