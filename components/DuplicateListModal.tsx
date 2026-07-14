"use client";

import { useEffect, useRef, useState } from "react";
import { EMOJI_OPTIONS } from "@/components/NewListModal";
import {
  PALETTE_BG_CLASS,
  PALETTE_COLORS,
  PALETTE_LABELS,
  type PaletteColor,
} from "@/lib/palette";
import { duplicateList } from "@/lib/storage";
import type { PackingList } from "@/lib/types";

type Step = "quantity" | "details";

interface DuplicateListModalProps {
  list: PackingList | null;
  open: boolean;
  onClose: () => void;
  onCreate: (list: PackingList) => void;
}

export function DuplicateListModal({
  list,
  open,
  onClose,
  onCreate,
}: DuplicateListModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("quantity");
  const [resetQuantities, setResetQuantities] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [color, setColor] = useState<PaletteColor>(PALETTE_COLORS[0]);
  const [tripDate, setTripDate] = useState("");
  const [initializedForListId, setInitializedForListId] = useState<
    string | null
  >(null);

  if (open && list && list.id !== initializedForListId) {
    setInitializedForListId(list.id);
    setStep("quantity");
    setName(list.name);
    setEmoji(list.emoji);
    setColor(list.color);
    setTripDate("");
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function requestClose() {
    dialogRef.current?.close();
  }

  function handleNativeClose() {
    setInitializedForListId(null);
    onClose();
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) requestClose();
  }

  function handleChooseQuantities(reset: boolean) {
    setResetQuantities(reset);
    setStep("details");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!list) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const newList = duplicateList(list.id, {
      name: trimmedName,
      emoji,
      color,
      tripDate: tripDate || null,
      resetQuantities,
    });
    if (!newList) return;
    onCreate(newList);
    requestClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleNativeClose}
      onClick={handleDialogClick}
      className="pk-dialog bg-background text-foreground rounded-card fixed inset-0 m-auto max-h-[85vh] w-[min(24rem,90vw)] overflow-y-auto border-none p-0 shadow-xl backdrop:bg-black/40"
    >
      {step === "quantity" ? (
        <div className="flex flex-col gap-5 p-6">
          <h2 className="text-xl font-bold">Kopiraj popis</h2>
          <p className="text-foreground/70 text-sm">
            Sve stavke u kopiji kreću necheckirane. Što napraviti s
            količinama?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleChooseQuantities(false)}
              className="bg-foreground text-background rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Zadrži postojeće količine
            </button>
            <button
              type="button"
              onClick={() => handleChooseQuantities(true)}
              className="bg-foreground/10 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Vrati sve na 1
            </button>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="self-center px-4 py-2 text-sm font-medium"
          >
            Odustani
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <h2 className="text-xl font-bold">Nova kopija</h2>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Naziv
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Krk"
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

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Datum putovanja (opcionalno)
            <input
              type="date"
              value={tripDate}
              onChange={(event) => setTripDate(event.target.value)}
              className="border-foreground/20 rounded-lg border bg-transparent px-3 py-2 text-base font-normal"
            />
          </label>

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
              Kreiraj kopiju
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
