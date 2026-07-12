"use client";

import { useRef } from "react";
import type { Item } from "@/lib/types";

const LONG_PRESS_MS = 1500;
const MOVE_CANCEL_THRESHOLD_PX = 10;

interface ItemRowProps {
  item: Item;
  onToggleDone: () => void;
  onEdit: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  isDragging: boolean;
  pointerX: number;
  pointerY: number;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
}

// Prevents the browser from blurring another item's open editor when this
// row is tapped — without this, that editor collapses (shifting this row's
// position) between mousedown and click, so the click here can miss.
function keepFocus(event: React.MouseEvent) {
  event.preventDefault();
}

export function ItemRow({
  item,
  onToggleDone,
  onEdit,
  onIncrement,
  onDecrement,
  isDragging,
  pointerX,
  pointerY,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: ItemRowProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const startPos = useRef({ x: 0, y: 0 });
  const longPressActive = useRef(false);
  const suppressNextClick = useRef(false);

  function clearPressTimer() {
    if (pressTimer.current !== undefined) {
      clearTimeout(pressTimer.current);
      pressTimer.current = undefined;
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startPos.current = { x: event.clientX, y: event.clientY };
    longPressActive.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      longPressActive.current = true;
      navigator.vibrate?.(50);
      onDragStart(startPos.current.x, startPos.current.y);
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!longPressActive.current) {
      const dx = event.clientX - startPos.current.x;
      const dy = event.clientY - startPos.current.y;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD_PX) {
        clearPressTimer();
      }
      return;
    }
    event.preventDefault();
    onDragMove(event.clientX, event.clientY);
  }

  function handlePointerUp() {
    clearPressTimer();
    if (longPressActive.current) {
      longPressActive.current = false;
      suppressNextClick.current = true;
      onDragEnd();
    }
  }

  function handlePointerCancel() {
    clearPressTimer();
    if (longPressActive.current) {
      longPressActive.current = false;
      suppressNextClick.current = true;
      onDragCancel();
    }
  }

  function handleClick() {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    onEdit();
  }

  return (
    <div className="flex items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={item.done}
        onChange={onToggleDone}
        onMouseDown={keepFocus}
        aria-label={item.text}
        className="accent-foreground h-5 w-5 shrink-0"
      />
      <button
        type="button"
        onMouseDown={keepFocus}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`min-w-0 flex-1 truncate text-left ${
          item.done ? "text-foreground/50 line-through" : ""
        } ${isDragging ? "opacity-30" : ""}`}
      >
        {item.text}
      </button>
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
      {isDragging && (
        <div
          className="border-foreground/10 bg-background pointer-events-none fixed z-50 flex max-w-[80vw] items-center gap-2 rounded-lg border px-3 py-2 text-sm font-normal shadow-lg"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${pointerX + 12}px, ${
              pointerY - 48
            }px, 0) scale(1.05)`,
          }}
        >
          <span className="truncate">{item.text}</span>
          {item.quantityEnabled && (
            <span className="text-foreground/60 tabular-nums">
              ×{item.quantity}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
