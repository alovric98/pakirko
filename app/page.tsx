"use client";

import { useState, useSyncExternalStore } from "react";
import { ListCard } from "@/components/ListCard";
import { NewListModal } from "@/components/NewListModal";
import { loadState } from "@/lib/storage";
import type { PackingList } from "@/lib/types";

/* Lists live in localStorage; useSyncExternalStore bridges them into React
   without hydration mismatches (server has no localStorage, so the server
   snapshot is always empty — mirrors the pattern in ThemeProvider). The
   snapshot is cached so repeated calls return the same reference until
   invalidateListsCache() runs, as required by useSyncExternalStore. */
const EMPTY_LISTS: PackingList[] = [];
let cachedLists: PackingList[] | null = null;
let listeners: ReadonlyArray<() => void> = [];

function getListsSnapshot(): PackingList[] {
  if (cachedLists === null) cachedLists = loadState().lists;
  return cachedLists;
}

function getServerListsSnapshot(): PackingList[] {
  return EMPTY_LISTS;
}

function subscribeToLists(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function invalidateListsCache(): void {
  cachedLists = null;
  for (const listener of listeners) listener();
}

function sortLists(lists: PackingList[]): PackingList[] {
  return [...lists].sort((a, b) => {
    if (a.tripDate && b.tripDate) return a.tripDate.localeCompare(b.tripDate);
    if (a.tripDate) return -1;
    if (b.tripDate) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export default function Home() {
  const lists = useSyncExternalStore(
    subscribeToLists,
    getListsSnapshot,
    getServerListsSnapshot,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const sortedLists = sortLists(lists);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pakirko 🧳</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Novi popis"
          className="bg-foreground text-background flex h-10 w-10 items-center justify-center rounded-full text-xl font-semibold"
        >
          +
        </button>
      </header>

      {sortedLists.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-foreground/70">
            Nemaš još nijedan popis. Kreiraj svoj prvi popis za putovanje!
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-foreground text-background rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            + Kreiraj prvi popis
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <NewListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={() => invalidateListsCache()}
      />
    </main>
  );
}
