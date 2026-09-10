import { useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FilterBar } from "@/components/filter-bar";
import { VoterDrawer } from "@/components/voter-drawer";
import { VoterTable } from "@/components/voter-table";
import { VoterTabs } from "@/components/voter-tabs";
import { useVoterStore } from "@/lib/voter-store";
import type { ListTab } from "@/lib/types";

type VoterSearch = {
  district?: string;
  precinct?: string;
  party?: string;
  neighborhood?: string;
  q?: string;
  tab?: ListTab;
};

function parseTab(v: unknown): ListTab | undefined {
  if (
    v === "inman" ||
    v === "not-inman" ||
    v === "yard" ||
    v === "all" ||
    v === "unmarked" ||
    v === "nothome" ||
    v === "gotv"
  )
    return v;
  return undefined;
}

export const Route = createFileRoute("/voters")({
  validateSearch: (s: Record<string, unknown>): VoterSearch => ({
    district: typeof s.district === "string" ? s.district : undefined,
    precinct: typeof s.precinct === "string" ? s.precinct : undefined,
    party: typeof s.party === "string" ? s.party : undefined,
    neighborhood: typeof s.neighborhood === "string" ? s.neighborhood : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    tab: parseTab(s.tab),
  }),
  component: VotersPage,
});

function VotersPage() {
  const search = Route.useSearch();
  const load = useVoterStore((s) => s.load);
  const loaded = useVoterStore((s) => s.loaded);
  const error = useVoterStore((s) => s.error);
  const setFilter = useVoterStore((s) => s.setFilter);
  const voters = useVoterStore((s) => s.voters);
  const selectedId = useVoterStore((s) => s.selectedId);
  const filters = useVoterStore((s) => s.filters);
  const marks = useVoterStore((s) => s.marks);
  const sortKey = useVoterStore((s) => s.sortKey);
  const sortDir = useVoterStore((s) => s.sortDir);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setFilter("district", search.district ?? "");
    setFilter("precinct", search.precinct ?? "");
    setFilter("party", search.party ?? "");
    setFilter("neighborhood", search.neighborhood ?? "");
    if (search.q) setFilter("q", search.q);
    if (search.tab) setFilter("listTab", search.tab);
  }, [search, setFilter]);

  const rows = useMemo(() => useVoterStore.getState().filtered(), [
    voters,
    filters,
    marks,
    sortKey,
    sortDir,
    loaded,
  ]);

  const selected = selectedId ? voters.find((v) => v.id === selectedId) : undefined;
  const tabLabel =
    filters.listTab === "inman"
      ? "Voting Inman"
      : filters.listTab === "not-inman"
        ? "Not Voting Inman"
        : filters.listTab === "yard"
          ? "Yard sign"
          : filters.listTab === "unmarked"
            ? "Unmarked"
            : filters.listTab === "nothome"
              ? "Not home"
              : filters.listTab === "gotv"
                ? "GOTV"
                : "Voter file";

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="display text-3xl">{tabLabel}</h1>
        <p className="mt-1 max-w-prose text-sm text-ink-soft">
          {loaded ? voters.length.toLocaleString() : "…"} registered voters. ID tabs are mutually
          exclusive. Pull lists (GOTV, yard signs, not home) are work queues. Turnout scores local
          2025–26 voters above presidential-only 2024. Marks stay in this browser.
        </p>
      </div>
      <VoterTabs />
      <FilterBar rows={rows} />
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loaded && <p className="text-sm text-muted">Loading the master list…</p>}
      <div className={selected ? "grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]" : "grid"}>
        <VoterTable rows={rows} />
        {selected && (
          <div
            className="fixed inset-0 z-40 bg-ink/40 lg:static lg:z-auto lg:bg-transparent"
            onClick={() => useVoterStore.getState().select(null)}
          >
            <div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-[var(--radius-xl)] border border-line lg:static lg:max-h-none lg:rounded-[var(--radius-lg)]"
              onClick={(e) => e.stopPropagation()}
            >
              <VoterDrawer voter={selected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
