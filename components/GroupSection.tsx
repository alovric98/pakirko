"use client";

import { useState } from "react";
import { EditGroupModal } from "@/components/EditGroupModal";
import { ItemEditor } from "@/components/ItemEditor";
import { ItemRow } from "@/components/ItemRow";
import { invalidateListsCache } from "@/lib/listsStore";
import { PALETTE_BG_CLASS } from "@/lib/palette";
import {
  addItem,
  decrementItemQuantity,
  deleteItem,
  incrementItemQuantity,
  toggleItemDone,
  toggleItemQuantityEnabled,
  updateItemText,
} from "@/lib/storage";
import type { Group, Item } from "@/lib/types";

export interface DragState {
  itemId: string;
  fromGroupId: string;
  overGroupId: string;
  overIndex: number;
  pointerX: number;
  pointerY: number;
}

interface GroupSectionProps {
  group: Group;
  listId: string;
  dragState: DragState | null;
  onDragStart: (itemId: string, clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
}

function InsertionIndicator() {
  return <div className="bg-foreground my-1 h-0.5 rounded-full" />;
}

export function GroupSection({
  group,
  listId,
  dragState,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: GroupSectionProps) {
  const [text, setText] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editGroupOpen, setEditGroupOpen] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addItem(listId, group.id, trimmed);
    invalidateListsCache();
    setText("");
  }

  function handleToggleDone(itemId: string) {
    toggleItemDone(listId, group.id, itemId);
    invalidateListsCache();
  }

  function handleTextChange(itemId: string, value: string) {
    updateItemText(listId, group.id, itemId, value);
    invalidateListsCache();
  }

  function handleDelete(itemId: string) {
    deleteItem(listId, group.id, itemId);
    invalidateListsCache();
    setEditingItemId(null);
  }

  function handleToggleQuantityEnabled(itemId: string) {
    toggleItemQuantityEnabled(listId, group.id, itemId);
    invalidateListsCache();
  }

  function handleIncrement(itemId: string) {
    incrementItemQuantity(listId, group.id, itemId);
    invalidateListsCache();
  }

  function handleDecrement(itemId: string) {
    decrementItemQuantity(listId, group.id, itemId);
    invalidateListsCache();
  }

  function renderRow(item: Item) {
    const isDragging = dragState?.itemId === item.id;
    return item.id === editingItemId ? (
      <ItemEditor
        item={item}
        onTextChange={(value) => handleTextChange(item.id, value)}
        onDelete={() => handleDelete(item.id)}
        onToggleQuantityEnabled={() => handleToggleQuantityEnabled(item.id)}
        onIncrement={() => handleIncrement(item.id)}
        onDecrement={() => handleDecrement(item.id)}
        onClose={() => setEditingItemId(null)}
      />
    ) : (
      <ItemRow
        item={item}
        onToggleDone={() => handleToggleDone(item.id)}
        onEdit={() => setEditingItemId(item.id)}
        onIncrement={() => handleIncrement(item.id)}
        onDecrement={() => handleDecrement(item.id)}
        isDragging={isDragging}
        pointerX={dragState?.pointerX ?? 0}
        pointerY={dragState?.pointerY ?? 0}
        onDragStart={(clientX, clientY) => onDragStart(item.id, clientX, clientY)}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      />
    );
  }

  const isOverThisGroup = dragState?.overGroupId === group.id;
  const overIndex = dragState?.overIndex ?? -1;
  const draggedId = dragState?.itemId;

  /* The indicator is rendered INSIDE each item's own (stably-keyed) wrapper
     rather than as a sibling that changes position in the array. Repositioning
     a sibling element within a keyed list can make React unmount/remount the
     surrounding items on larger reorders, which drops setPointerCapture mid-
     gesture and freezes the drag (see Faza 6 reverse-drag bug). Item wrappers
     always stay in group.items order — only which one *shows* the indicator
     changes. */
  let nonDraggedSeen = 0;
  let indicatorPlaced = false;
  const itemNodes: React.ReactNode[] = [];
  for (const item of group.items) {
    const isDraggedItem = item.id === draggedId;
    const showIndicatorBefore =
      isOverThisGroup && !indicatorPlaced && !isDraggedItem && nonDraggedSeen === overIndex;
    if (showIndicatorBefore) indicatorPlaced = true;
    if (!isDraggedItem) nonDraggedSeen += 1;
    itemNodes.push(
      <div key={item.id} data-item-id={item.id}>
        {showIndicatorBefore && <InsertionIndicator />}
        {renderRow(item)}
      </div>,
    );
  }
  const showIndicatorAtEnd = isOverThisGroup && !indicatorPlaced;

  return (
    <section
      data-group-id={group.id}
      className={`${PALETTE_BG_CLASS[group.color]} rounded-card px-5 py-4`}
    >
      <button
        type="button"
        onClick={() => setEditGroupOpen(true)}
        className="flex min-w-0 items-center gap-2 text-left"
      >
        <span className="text-xl">{group.emoji}</span>
        <h2 className="truncate font-semibold">{group.name}</h2>
      </button>

      <EditGroupModal
        open={editGroupOpen}
        onClose={() => setEditGroupOpen(false)}
        onUpdate={() => invalidateListsCache()}
        listId={listId}
        group={group}
      />

      {group.items.length === 0 && !isOverThisGroup ? (
        <p className="text-foreground/60 mt-2 text-sm">Još nema stavki.</p>
      ) : (
        <div className="divide-foreground/10 mt-2 flex flex-col divide-y">
          {itemNodes}
          {showIndicatorAtEnd && <InsertionIndicator />}
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
