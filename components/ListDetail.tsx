"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { GroupSection, type DragState } from "@/components/GroupSection";
import { NewGroupModal } from "@/components/NewGroupModal";
import { ProgressRing } from "@/components/ProgressRing";
import {
  getListsSnapshot,
  getServerListsSnapshot,
  invalidateListsCache,
  subscribeToLists,
} from "@/lib/listsStore";
import { moveItem } from "@/lib/storage";

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
  const [dragState, setDragState] = useState<DragState | null>(null);

  const list = lists.find((l) => l.id === id);

  const handleDragStart = useCallback(
    (itemId: string, groupId: string, clientX: number, clientY: number) => {
      const startIndex =
        list?.groups
          .find((g) => g.id === groupId)
          ?.items.findIndex((item) => item.id === itemId) ?? 0;
      setDragState({
        itemId,
        fromGroupId: groupId,
        overGroupId: groupId,
        overIndex: startIndex,
        pointerX: clientX,
        pointerY: clientY,
      });
    },
    [list],
  );

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    setDragState((prev) => {
      if (!prev) return prev;
      const elements = document.elementsFromPoint(clientX, clientY);
      const groupEl = elements.find((el) =>
        el.hasAttribute("data-group-id"),
      ) as HTMLElement | undefined;
      if (!groupEl) {
        return { ...prev, pointerX: clientX, pointerY: clientY };
      }
      const groupId = groupEl.getAttribute("data-group-id")!;
      const itemEls = Array.from(
        groupEl.querySelectorAll<HTMLElement>("[data-item-id]"),
      ).filter((el) => el.getAttribute("data-item-id") !== prev.itemId);
      let index = itemEls.length;
      for (let i = 0; i < itemEls.length; i++) {
        const rect = itemEls[i].getBoundingClientRect();
        if (clientY < rect.top + rect.height / 2) {
          index = i;
          break;
        }
      }
      return {
        ...prev,
        overGroupId: groupId,
        overIndex: index,
        pointerX: clientX,
        pointerY: clientY,
      };
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragState && list) {
      moveItem(list.id, dragState.itemId, dragState.overGroupId, dragState.overIndex);
      invalidateListsCache();
    }
    setDragState(null);
  }, [dragState, list]);

  const handleDragCancel = useCallback(() => {
    setDragState(null);
  }, []);

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
            <GroupSection
              key={group.id}
              group={group}
              listId={list.id}
              dragState={dragState}
              onDragStart={(itemId, clientX, clientY) =>
                handleDragStart(itemId, group.id, clientX, clientY)
              }
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            />
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
