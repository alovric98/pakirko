import type { Item } from "@/lib/types";

interface ItemRowProps {
  item: Item;
  onToggle: () => void;
}

export function ItemRow({ item, onToggle }: ItemRowProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={item.done}
        onChange={onToggle}
        className="accent-foreground h-5 w-5 shrink-0"
      />
      <span
        className={
          item.done ? "text-foreground/50 truncate line-through" : "truncate"
        }
      >
        {item.text}
      </span>
    </label>
  );
}
