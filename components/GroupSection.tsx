import { PALETTE_BG_CLASS } from "@/lib/palette";
import type { Group } from "@/lib/types";

interface GroupSectionProps {
  group: Group;
}

export function GroupSection({ group }: GroupSectionProps) {
  return (
    <section
      className={`${PALETTE_BG_CLASS[group.color]} rounded-card px-5 py-4`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{group.emoji}</span>
        <h2 className="truncate font-semibold">{group.name}</h2>
      </div>
      <p className="text-foreground/60 mt-2 text-sm">Još nema stavki.</p>
    </section>
  );
}
