import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SortKey } from "@/lib/voter-store";
import { useVoterStore } from "@/lib/voter-store";
import type { Voter } from "@/lib/types";
import { formatDate, formatPhone, fullName, PARTY_SHORT, titleCaseStreet } from "@/lib/format";
import { turnoutScore, turnoutTier, TURNOUT_LABEL } from "@/lib/turnout";
import { Badge, distTone, partyTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InmanActions } from "@/components/inman-actions";
import { cn } from "@/lib/utils";

const COLS: { key: SortKey; label: string; hide?: string }[] = [
  { key: "name", label: "Name" },
  { key: "addr", label: "Address", hide: "hidden sm:table-cell" },
  { key: "region", label: "Region", hide: "hidden lg:table-cell" },
  { key: "dist", label: "Dist" },
  { key: "pct", label: "Pct", hide: "hidden sm:table-cell" },
  { key: "party", label: "Pty" },
  { key: "age", label: "Age", hide: "hidden md:table-cell" },
  { key: "lv", label: "Last vote", hide: "hidden xl:table-cell" },
  { key: "turnout", label: "TO", hide: "hidden md:table-cell" },
];

export function VoterTable({ rows }: { rows: Voter[] }) {
  const sortKey = useVoterStore((s) => s.sortKey);
  const sortDir = useVoterStore((s) => s.sortDir);
  const setSort = useVoterStore((s) => s.setSort);
  const page = useVoterStore((s) => s.page);
  const pageSize = useVoterStore((s) => s.pageSize);
  const setPage = useVoterStore((s) => s.setPage);
  const select = useVoterStore((s) => s.select);
  const selectedId = useVoterStore((s) => s.selectedId);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = rows.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wide text-muted">
            <tr>
              {COLS.map((c) => (
                <th key={c.key} className={cn("px-3 py-2 font-semibold", c.hide)}>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => setSort(c.key)}>
                    {c.label}
                    {sortKey === c.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
              <th className="hidden px-3 py-2 font-semibold xl:table-cell">Phone</th>
              <th className="px-3 py-2 font-semibold">Inman</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((v) => {
              return (
                <tr
                  key={v.id}
                  onClick={() => select(v.id)}
                  className={cn(
                    "cursor-pointer border-b border-line/70 hover:bg-paper-2",
                    selectedId === v.id && "bg-paper-2",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{fullName(v)}</div>
                    <div className="text-xs text-muted sm:hidden">{titleCaseStreet(v.addr)}</div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-ink-soft sm:table-cell">{titleCaseStreet(v.addr)}</td>
                  <td className="hidden px-3 py-2.5 text-xs text-ink-soft lg:table-cell">{v.region || "—"}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={distTone(v.dist)}>{v.dist}</Badge>
                  </td>
                  <td className="hidden px-3 py-2.5 font-mono text-xs sm:table-cell">{v.pct}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={partyTone(v.party)}>{PARTY_SHORT[v.party] ?? v.party}</Badge>
                  </td>
                  <td className="hidden px-3 py-2.5 tabular md:table-cell">{v.age ?? "—"}</td>
                  <td className="hidden px-3 py-2.5 text-muted xl:table-cell">{formatDate(v.lv)}</td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    <TurnoutPill v={v} />
                  </td>
                  <td className="hidden px-3 py-2.5 xl:table-cell">{formatPhone(v.phone)}</td>
                  <td className="px-2 py-2">
                    <InmanActions id={v.id} compact />
                  </td>
                </tr>
              );
            })}
            {!slice.length && (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-muted">
                  No voters on this list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 text-sm text-muted">
        <span className="tabular">
          {rows.length.toLocaleString()} voters
          {rows.length ? ` · ${safePage * pageSize + 1}–${Math.min(rows.length, (safePage + 1) * pageSize)}` : ""}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={safePage <= 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="tabular text-xs">
            {safePage + 1}/{pages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={safePage >= pages - 1}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TurnoutPill({ v }: { v: Voter }) {
  const t = turnoutTier(v);
  const tone =
    t === "likely" ? "text-ok" : t === "dropoff" ? "text-warn" : "text-muted";
  return (
    <span className={cn("tabular text-xs font-semibold", tone)} title={TURNOUT_LABEL[t]}>
      {turnoutScore(v)} {TURNOUT_LABEL[t]}
    </span>
  );
}
