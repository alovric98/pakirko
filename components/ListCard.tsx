import { formatCountdown } from "@/lib/countdown";
import { PALETTE_BG_CLASS } from "@/lib/palette";
import type { PackingList } from "@/lib/types";
import { ProgressRing } from "./ProgressRing";

interface ListCardProps {
  list: PackingList;
}

export function ListCard({ list }: ListCardProps) {
  const items = list.groups.flatMap((group) => group.items);
  const done = items.filter((item) => item.done).length;
  const total = items.length;
  const countdown = formatCountdown(list.tripDate);

  return (
    <article
      className={`${PALETTE_BG_CLASS[list.color]} rounded-card flex items-center gap-4 px-5 py-4`}
    >
      <ProgressRing
        value={done}
        max={total}
        className="shrink-0 text-foreground/80"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{list.emoji}</span>
          <h2 className="truncate text-lg font-semibold">{list.name}</h2>
        </div>
        <p className="text-foreground/70 mt-1 text-sm">
          Spremno {done}/{total}
        </p>
        {countdown && (
          <p className="mt-0.5 text-sm font-medium">{countdown}</p>
        )}
      </div>
    </article>
  );
}
