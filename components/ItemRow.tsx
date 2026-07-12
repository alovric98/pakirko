import type { Item } from "@/lib/types";

interface ItemRowProps {
  item: Item;
  onToggleDone: () => void;
  onEdit: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
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
}: ItemRowProps) {
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
        onClick={onEdit}
        className={`min-w-0 flex-1 truncate text-left ${
          item.done ? "text-foreground/50 line-through" : ""
        }`}
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
    </div>
  );
}
