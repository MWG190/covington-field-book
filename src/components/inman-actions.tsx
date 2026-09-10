import { cn } from "@/lib/utils";
import { useVoterStore } from "@/lib/voter-store";

export function InmanActions({
  id,
  compact,
}: {
  id: string;
  compact?: boolean;
}) {
  const mark = useVoterStore((s) => s.marks[id]);
  const setInman = useVoterStore((s) => s.setInman);
  const setYard = useVoterStore((s) => s.setYard);
  const inman = mark?.inman ?? "";
  const yard = Boolean(mark?.yard);

  return (
    <div
      className={cn("flex flex-wrap gap-1", compact ? "justify-end" : "")}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Chip
        active={inman === "yes"}
        tone="ok"
        compact={compact}
        onClick={() => setInman(id, "yes")}
        label="Voting Inman"
      />
      <Chip
        active={inman === "no"}
        tone="no"
        compact={compact}
        onClick={() => setInman(id, "no")}
        label="Not Voting Inman"
      />
      <Chip
        active={yard}
        tone="yard"
        compact={compact}
        onClick={() => setYard(id)}
        label="Yard sign"
      />
    </div>
  );
}

function Chip({
  active,
  tone,
  compact,
  onClick,
  label,
}: {
  active: boolean;
  tone: "ok" | "no" | "yard";
  compact?: boolean;
  onClick: () => void;
  label: string;
}) {
  const on = {
    ok: "border-ok bg-ok text-paper",
    no: "border-danger bg-danger text-paper",
    yard: "border-river bg-river text-river-fg",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border font-semibold transition-[background-color,color] duration-150",
        compact ? "min-h-9 px-2.5 text-[11px]" : "min-h-10 px-3 text-xs",
        active ? on : "border-line bg-paper text-ink-soft hover:bg-paper-2",
      )}
    >
      {label}
    </button>
  );
}
