"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { DuplicateListModal } from "@/components/DuplicateListModal";
import { ListCard } from "@/components/ListCard";
import { NewListModal } from "@/components/NewListModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getListsSnapshot,
  getServerListsSnapshot,
  invalidateListsCache,
  subscribeToLists,
} from "@/lib/listsStore";
import type { PackingList } from "@/lib/types";

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
  const [copyingList, setCopyingList] = useState<PackingList | null>(null);
  const router = useRouter();

  const sortedLists = sortLists(lists);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pakirko 🧳</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-label="Novi popis"
            className="bg-foreground text-background flex h-10 w-10 items-center justify-center rounded-full text-xl font-semibold"
          >
            +
          </button>
        </div>
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
            <ListCard key={list.id} list={list} onCopy={setCopyingList} />
          ))}
        </div>
      )}

      <NewListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={() => invalidateListsCache()}
      />

      <DuplicateListModal
        list={copyingList}
        open={copyingList !== null}
        onClose={() => setCopyingList(null)}
        onCreate={(newList) => {
          invalidateListsCache();
          router.push(`/popis/${newList.id}`);
        }}
      />
    </main>
  );
}
