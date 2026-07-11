"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { GroupSection } from "@/components/GroupSection";
import { NewGroupModal } from "@/components/NewGroupModal";
import { ProgressRing } from "@/components/ProgressRing";
import {
  getListsSnapshot,
  getServerListsSnapshot,
  invalidateListsCache,
  subscribeToLists,
} from "@/lib/listsStore";

interface ListDetailProps {
  id: string;
}

export function ListDetail({ id }: ListDetailProps) {
  const lists = useSyncExternalStore(
    subscribeToLists,
    getListsSnapshot,
    getServerListsSnapshot,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const list = lists.find((l) => l.id === id);

  if (!list) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-foreground/70">
            Popis nije pronađen.
            <br />
            Provjeri je li poveznica ispravna.
          </p>
          <Link
            href="/"
            className="bg-foreground text-background rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Natrag na početnu
          </Link>
        </div>
      </main>
    );
  }

  const items = list.groups.flatMap((group) => group.items);
  const done = items.filter((item) => item.done).length;
  const total = items.length;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex items-center gap-4">
        <Link
          href="/"
          aria-label="Natrag na početnu"
          className="bg-foreground/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
        >
          ←
        </Link>
        <ProgressRing
          value={done}
          max={total}
          className="shrink-0 text-foreground/80"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{list.emoji}</span>
            <h1 className="truncate text-xl font-bold">{list.name}</h1>
          </div>
          <p className="text-foreground/70 mt-1 text-sm">
            Spremno {done}/{total}
          </p>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="bg-foreground text-background self-start rounded-full px-5 py-2.5 text-sm font-semibold"
      >
        + Dodaj grupu
      </button>

      {list.groups.length === 0 ? (
        <p className="text-foreground/70 py-8 text-center">
          Još nema grupa. Dodaj prvu grupu za organizaciju stvari.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.groups.map((group) => (
            <GroupSection key={group.id} group={group} listId={list.id} />
          ))}
        </div>
      )}

      <NewGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={() => invalidateListsCache()}
        listId={list.id}
      />
    </main>
  );
}
