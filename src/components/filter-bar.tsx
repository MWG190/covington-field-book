import { Download, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVoterStore } from "@/lib/voter-store";
import { REGION_META } from "@/lib/format";
import type { Voter } from "@/lib/types";

const PRECINCTS = ["C01", "C02", "C03", "C04", "C06", "C07", "C08", "C09", "C11", "310"];
const WALK = REGION_META.filter((r) => r.kind === "walk");
const REST = REGION_META.filter((r) => r.kind === "region");

export function FilterBar({ rows }: { rows: Voter[] }) {
  const f = useVoterStore((s) => s.filters);
  const setFilter = useVoterStore((s) => s.setFilter);
  const reset = useVoterStore((s) => s.resetFilters);
  const exportCsv = useVoterStore((s) => s.exportCsv);

  return (
    <div className="grid gap-3 rounded-[var(--radius-lg)] border border-line bg-panel p-3 md:p-4">
      <Input
        value={f.q}
        onChange={(e) => setFilter("q", e.target.value)}
        placeholder="Search name, street, phone, region, registration number"
        aria-label="Search voters"
      />
      <div className="flex flex-wrap gap-1.5">
        {(["", "A", "B", "C", "D", "E"] as const).map((d) => (
          <button
            key={d || "all"}
            type="button"
            onClick={() => setFilter("district", d)}
            className={`min-h-10 rounded-full px-3 text-xs font-semibold ${
              f.district === d ? "bg-ink text-paper" : "bg-paper-2 text-ink-soft"
            }`}
          >
            {d ? `District ${d}` : "All districts"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.neighborhood}
          onChange={(e) => setFilter("neighborhood", e.target.value)}
          aria-label="Region"
        >
          <option value="">All regions</option>
          <optgroup label="Walk-sheet tabs">
            {WALK.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Street regions">
            {REST.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
              </option>
            ))}
          </optgroup>
        </select>
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.precinct}
          onChange={(e) => setFilter("precinct", e.target.value)}
          aria-label="Precinct"
        >
          <option value="">All precincts</option>
          {PRECINCTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.party}
          onChange={(e) => setFilter("party", e.target.value)}
          aria-label="Party"
        >
          <option value="">All parties</option>
          <option value="REP">Republican</option>
          <option value="DEM">Democrat</option>
          <option value="NOPTY">No party</option>
          <option value="LBT">Libertarian</option>
          <option value="GRN">Green</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.race}
          onChange={(e) => setFilter("race", e.target.value)}
          aria-label="Race"
        >
          <option value="">All races</option>
          <option value="W">White</option>
          <option value="B">Black</option>
          <option value="H">Hispanic</option>
          <option value="A">Asian</option>
          <option value="I">American Indian</option>
          <option value="O">Other</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.mark}
          onChange={(e) => setFilter("mark", e.target.value as typeof f.mark)}
          aria-label="Field mark"
        >
          <option value="any">Any mark</option>
          <option value="uncontacted">Uncontacted</option>
          <option value="contacted">Contacted</option>
          <option value="not-home">Not home</option>
          <option value="supporter">Supporter</option>
          <option value="lean">Lean</option>
          <option value="opposed">Opposed</option>
          <option value="refused">Refused</option>
        </select>
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.phone}
          onChange={(e) => setFilter("phone", e.target.value as typeof f.phone)}
          aria-label="Phone"
        >
          <option value="any">Phone: any</option>
          <option value="yes">Has phone</option>
          <option value="no">No phone</option>
        </select>
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.voted2024}
          onChange={(e) => setFilter("voted2024", e.target.value as typeof f.voted2024)}
          aria-label="November 2024"
        >
          <option value="any">Nov 2024: any</option>
          <option value="yes">Voted Nov 2024</option>
          <option value="no">Did not vote Nov 2024</option>
        </select>
        <select
          className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
          value={f.sex}
          onChange={(e) => setFilter("sex", e.target.value)}
          aria-label="Sex"
        >
          <option value="">Any sex</option>
          <option value="F">Female</option>
          <option value="M">Male</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={reset} type="button">
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <Button
          variant="ink"
          className="flex-1"
          type="button"
          onClick={() => exportCsv(rows)}
          disabled={!rows.length}
        >
          <Download className="size-4" />
          CSV
        </Button>
      </div>
    </div>
  );
}
