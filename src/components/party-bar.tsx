import type { SliceStats } from "@/lib/types";
import { pct } from "@/lib/format";

const ORDER = ["REP", "DEM", "NOPTY", "LBT", "GRN", "OTHER"] as const;
const COLOR: Record<string, string> = {
  REP: "bg-party-r",
  DEM: "bg-party-d",
  NOPTY: "bg-faint",
  LBT: "bg-ink-soft",
  GRN: "bg-ok",
  OTHER: "bg-line-strong",
};

export function PartyBar({ stats, compact }: { stats: SliceStats; compact?: boolean }) {
  const n = stats.n || 1;
  return (
    <div className="grid gap-2">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-paper-2">
        {ORDER.map((k) => {
          const v = stats.parties[k] ?? 0;
          if (!v) return null;
          return (
            <div
              key={k}
              className={COLOR[k]}
              style={{ width: `${(v / n) * 100}%` }}
              title={`${k} ${v}`}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {ORDER.map((k) => {
            const v = stats.parties[k] ?? 0;
            if (!v) return null;
            return (
              <span key={k} className="tabular">
                <span className="font-semibold text-ink-soft">{k}</span> {v} ({pct(v, stats.n)})
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
