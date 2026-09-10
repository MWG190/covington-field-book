import type { ListTab, TurnoutFilter } from "@/lib/types";
import { useVoterStore } from "@/lib/voter-store";
import { TURNOUT_LABEL } from "@/lib/turnout";
import { cn } from "@/lib/utils";

const ID_TABS: { id: ListTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unmarked", label: "Unmarked" },
  { id: "inman", label: "Voting Inman" },
  { id: "not-inman", label: "Not Voting Inman" },
];

const PULL_TABS: { id: ListTab; label: string }[] = [
  { id: "gotv", label: "GOTV" },
  { id: "yard", label: "Yard sign" },
  { id: "nothome", label: "Not home" },
];

const TURNOUT: { id: TurnoutFilter; label: string }[] = [
  { id: "any", label: "Any turnout" },
  { id: "likely", label: TURNOUT_LABEL.likely },
  { id: "dropoff", label: TURNOUT_LABEL.dropoff },
  { id: "unlikely", label: TURNOUT_LABEL.unlikely },
];

export function VoterTabs() {
  const listTab = useVoterStore((s) => s.filters.listTab);
  const turnout = useVoterStore((s) => s.filters.turnout);
  const setFilter = useVoterStore((s) => s.setFilter);
  const marks = useVoterStore((s) => s.marks);
  const filters = useVoterStore((s) => s.filters);
  const voters = useVoterStore((s) => s.voters);
  const tabCounts = useVoterStore((s) => s.tabCounts);
  const counts = tabCounts();
  void marks;
  void filters;
  void voters;

  const n: Record<ListTab, number> = {
    all: counts.all,
    unmarked: counts.unmarked,
    inman: counts.inman,
    "not-inman": counts.notInman,
    nothome: counts.nothome,
    yard: counts.yard,
    gotv: counts.gotv,
  };

  return (
    <div className="grid gap-2">
      <TabRow label="ID" tabs={ID_TABS} active={listTab} counts={n} onPick={(id) => setFilter("listTab", id)} />
      <TabRow
        label="Pull lists"
        tabs={PULL_TABS}
        active={listTab}
        counts={n}
        onPick={(id) => setFilter("listTab", id)}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-16 shrink-0 text-[11px] uppercase tracking-wide text-faint">Turnout</span>
        {TURNOUT.map((t) => {
          const on = turnout === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter("turnout", t.id)}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold",
                on ? "bg-river text-river-fg" : "bg-paper-2 text-ink-soft",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabRow({
  label,
  tabs,
  active,
  counts,
  onPick,
}: {
  label: string;
  tabs: { id: ListTab; label: string }[];
  active: ListTab;
  counts: Record<ListTab, number>;
  onPick: (id: ListTab) => void;
}) {
  return (
    <div className="flex items-stretch gap-2">
      <span className="hidden w-16 shrink-0 self-center text-[11px] uppercase tracking-wide text-faint sm:block">
        {label}
      </span>
      <div
        role="tablist"
        aria-label={label}
        className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-paper-2 p-1"
      >
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onPick(t.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-semibold transition-[background-color,color] duration-150",
                on ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper",
              )}
            >
              {t.label}
              <span className={cn("tabular text-xs", on ? "text-paper/70" : "text-faint")}>
                {counts[t.id].toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
