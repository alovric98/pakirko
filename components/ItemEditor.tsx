"use client";

import { useEffect, useRef } from "react";
import type { Item } from "@/lib/types";

interface ItemEditorProps {
  item: Item;
  onTextChange: (text: string) => void;
  onDelete: () => void;
  onToggleQuantityEnabled: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onClose: () => void;
}

// Prevents the browser from blurring the text input when a sibling control
// is tapped — without this, iOS Safari blurs the input on mousedown BEFORE
// the click on that control fires, closing the editor before the action runs.
function keepFocus(event: React.MouseEvent) {
  event.preventDefault();
}

export function ItemEditor({
  item,
  onTextChange,
  onDelete,
  onToggleQuantityEnabled,
  onIncrement,
  onDecrement,
  onClose,
}: ItemEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onClose();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") onClose();
  }

  return (
    <div onBlur={handleBlur} className="flex flex-col gap-2 py-1.5">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={item.text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className="border-foreground/20 min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-base font-normal"
        />
        {item.quantityEnabled && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onMouseDown={keepFocus}
              onClick={onDecrement}
              disabled={item.quantity <= 1}
              aria-label="Smanji količinu"
              className="bg-foreground/10 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold disabled:opacity-40"
            >
              −
            </button>
            <span className="w-5 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onMouseDown={keepFocus}
              onClick={onIncrement}
              aria-label="Povećaj količinu"
              className="bg-foreground/10 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
            >
              +
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <label
          onMouseDown={keepFocus}
          className="flex items-center gap-2 text-sm"
        >
          <input
            type="checkbox"
            checked={item.quantityEnabled}
            onChange={onToggleQuantityEnabled}
            className="accent-foreground h-4 w-4"
          />
          Količina
        </label>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={onDelete}
          className="px-1 py-2 text-sm font-medium"
        >
          Obriši
        </button>
      </div>
    </div>
  );
}
