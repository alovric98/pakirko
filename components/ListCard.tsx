import Link from "next/link";
import { formatCountdown } from "@/lib/countdown";
import { PALETTE_BG_CLASS } from "@/lib/palette";
import type { PackingList } from "@/lib/types";
import { ProgressRing } from "./ProgressRing";

interface ListCardProps {
  list: PackingList;
  onCopy: (list: PackingList) => void;
}

export function ListCard({ list, onCopy }: ListCardProps) {
  const items = list.groups.flatMap((group) => group.items);
  const done = items.filter((item) => item.done).length;
  const total = items.length;
  const countdown = formatCountdown(list.tripDate);

  return (
    <div className="relative">
      <Link href={`/popis/${list.id}`} className="block">
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
      </Link>
      <button
        type="button"
        onClick={() => onCopy(list)}
        aria-label={`Kopiraj popis ${list.name}`}
        className="bg-background/70 absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-base"
      >
        📋
      </button>
    </div>
  );
}
