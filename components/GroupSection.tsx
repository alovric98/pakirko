"use client";

import { useState } from "react";
import { ItemRow } from "@/components/ItemRow";
import { invalidateListsCache } from "@/lib/listsStore";
import { PALETTE_BG_CLASS } from "@/lib/palette";
import { addItem, toggleItemDone } from "@/lib/storage";
import type { Group } from "@/lib/types";

interface GroupSectionProps {
  group: Group;
  listId: string;
}

export function GroupSection({ group, listId }: GroupSectionProps) {
  const [text, setText] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addItem(listId, group.id, trimmed);
    invalidateListsCache();
    setText("");
  }

  function handleToggle(itemId: string) {
    toggleItemDone(listId, group.id, itemId);
    invalidateListsCache();
  }

  return (
    <section
      className={`${PALETTE_BG_CLASS[group.color]} rounded-card px-5 py-4`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{group.emoji}</span>
        <h2 className="truncate font-semibold">{group.name}</h2>
      </div>

      {group.items.length === 0 ? (
        <p className="text-foreground/60 mt-2 text-sm">Još nema stavki.</p>
      ) : (
        <div className="divide-foreground/10 mt-2 flex flex-col divide-y">
          {group.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Dodaj stavku…"
          className="border-foreground/20 w-full rounded-lg border bg-transparent px-3 py-2 text-base font-normal"
        />
      </form>
    </section>
  );
}
