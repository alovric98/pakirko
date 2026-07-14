"use client";

import { useEffect, useRef, useState } from "react";
import {
  PALETTE_BG_CLASS,
  PALETTE_COLORS,
  PALETTE_LABELS,
  type PaletteColor,
} from "@/lib/palette";
import { updateGroup } from "@/lib/storage";
import type { Group } from "@/lib/types";

const EMOJI_OPTIONS = [
  "👕",
  "🧴",
  "🔌",
  "📄",
  "👟",
  "🧢",
  "💊",
  "🕶️",
  "🧦",
  "🎧",
  "📷",
  "🩳",
];

interface EditGroupModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (group: Group) => void;
  listId: string;
  group: Group;
}

export function EditGroupModal({
  open,
  onClose,
  onUpdate,
  listId,
  group,
}: EditGroupModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(group.name);
  const [emoji, setEmoji] = useState(group.emoji);
  const [color, setColor] = useState<PaletteColor>(group.color);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setName(group.name);
      setEmoji(group.emoji);
      setColor(group.color);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, group]);

  function requestClose() {
    dialogRef.current?.close();
  }

  function handleNativeClose() {
    onClose();
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) requestClose();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const updated = updateGroup(listId, group.id, {
      name: trimmedName,
      emoji,
      color,
    });
    onUpdate(updated);
    requestClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleNativeClose}
      onClick={handleDialogClick}
      className="pk-dialog bg-background text-foreground rounded-card fixed inset-0 m-auto max-h-[85vh] w-[min(24rem,90vw)] overflow-y-auto border-none p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <h2 className="text-xl font-bold">Uredi grupu</h2>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Naziv
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Odjeća"
            required
            className="border-foreground/20 rounded-lg border bg-transparent px-3 py-2 text-base font-normal"
          />
        </label>

        <div className="flex flex-col gap-1.5 text-sm font-medium">
          Emoji
          <div className="grid grid-cols-6 gap-2">
            {EMOJI_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setEmoji(option)}
                aria-pressed={emoji === option}
                className={`rounded-lg py-2 text-xl ${
                  emoji === option
                    ? "bg-foreground/15 ring-foreground/40 ring-2"
                    : "bg-foreground/5"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-medium">
          Boja
          <div className="flex gap-2">
            {PALETTE_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-pressed={color === option}
                aria-label={PALETTE_LABELS[option]}
                className={`${PALETTE_BG_CLASS[option]} h-9 w-9 rounded-full ${
                  color === option
                    ? "ring-foreground/60 ring-offset-background ring-2 ring-offset-2"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={requestClose}
            className="px-4 py-2 text-sm font-medium"
          >
            Odustani
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-foreground text-background rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Spremi
          </button>
        </div>
      </form>
    </dialog>
  );
}
