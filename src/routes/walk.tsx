import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FilterBar } from "@/components/filter-bar";
import { InmanActions } from "@/components/inman-actions";
import { VoterDrawer } from "@/components/voter-drawer";
import { VoterTabs } from "@/components/voter-tabs";
import { Badge, distTone, partyTone } from "@/components/ui/badge";
import { formatPhone, fullName, PARTY_SHORT, REGION_META, titleCaseStreet, WALK_SHEETS } from "@/lib/format";
import { groupWalkRegions, useVoterStore } from "@/lib/voter-store";

type WalkSearch = { neighborhood?: string; district?: string };

export const Route = createFileRoute("/walk")({
  validateSearch: (s: Record<string, unknown>): WalkSearch => ({
    neighborhood: typeof s.neighborhood === "string" ? s.neighborhood : undefined,
    district: typeof s.district === "string" ? s.district : undefined,
  }),
  component: WalkPage,
});

function WalkPage() {
  const search = Route.useSearch();
  const load = useVoterStore((s) => s.load);
  const loaded = useVoterStore((s) => s.loaded);
  const setFilter = useVoterStore((s) => s.setFilter);
  const voters = useVoterStore((s) => s.voters);
  const filters = useVoterStore((s) => s.filters);
  const marks = useVoterStore((s) => s.marks);
  const select = useVoterStore((s) => s.select);
  const selectedId = useVoterStore((s) => s.selectedId);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setFilter("neighborhood", search.neighborhood ?? "");
    setFilter("district", search.district ?? "");
  }, [search.neighborhood, search.district, setFilter]);

  const rows = useMemo(() => useVoterStore.getState().filtered(), [voters, filters, marks, loaded]);
  const regions = useMemo(() => groupWalkRegions(rows), [rows]);
  const selected = selectedId ? voters.find((v) => v.id === selectedId) : undefined;
  const [openRegion, setOpenRegion] = useState<string | null>(null);
  const [openStreet, setOpenStreet] = useState<string | null>(null);

  useEffect(() => {
    if (!regions.length) return;
    setOpenRegion((cur) => {
      if (filters.neighborhood) return filters.neighborhood;
      if (cur && regions.some((r) => r.region === cur)) return cur;
      return regions[0].region;
    });
  }, [regions, filters.neighborhood]);

  const streetCount = regions.reduce((n, r) => n + r.streets.length, 0);
  const regionWord = regions.length === 1 ? "region" : "regions";

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Standalone canvassing</p>
        <h1 className="display mt-1 text-3xl">Door lists</h1>
        <p className="mt-1 max-w-prose text-sm text-ink-soft">
          Pull a list (GOTV, yard signs, unmarked), then walk region → street → house. Tag Voting
          Inman, Not Voting Inman, or Yard sign at the door. {rows.length.toLocaleString()} voters
          on {streetCount} streets in {regions.length} {regionWord}.{" "}
          <Link to="/turf" className="font-semibold text-river">
            Turf cutter →
          </Link>
        </p>
      </div>

      <VoterTabs />

      <div className="flex flex-wrap gap-1.5">
        {WALK_SHEETS.map((name) => {
          const active = filters.neighborhood === name;
          return (
            <Link
              key={name}
              to="/walk"
              search={{ neighborhood: name }}
              className={`inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold ${
                active ? "bg-ink text-paper" : "bg-paper-2 text-ink-soft"
              }`}
            >
              {name}
            </Link>
          );
        })}
        <Link
          to="/walk"
          search={{}}
          onClick={() => setFilter("neighborhood", "")}
          className={`inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold ${
            !filters.neighborhood ? "bg-ink text-paper" : "bg-paper-2 text-ink-soft"
          }`}
        >
          All regions
        </Link>
      </div>

      <FilterBar rows={rows} />
      <div className={selected ? "grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]" : "grid"}>
        <div className="grid gap-3">
          {regions.map((rg) => {
            const meta = REGION_META.find((m) => m.name === rg.region);
            const isOpen = openRegion === rg.region;
            return (
              <section
                key={rg.region}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-panel"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                  onClick={() => setOpenRegion(isOpen ? null : rg.region)}
                >
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{rg.region}</span>
                      {meta?.kind === "walk" ? (
                        <Badge>Walk sheet</Badge>
                      ) : (
                        <span className="text-[11px] uppercase tracking-wide text-faint">Region</span>
                      )}
                    </span>
                    {meta?.blurb ? (
                      <span className="mt-1 block text-xs text-muted">{meta.blurb}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {rg.streets.length} streets · {rg.people.length} voters
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-line">
                    {rg.streets.map((st) => {
                      const streetKey = `${rg.region}::${st.street}`;
                      const streetOpen = openStreet === streetKey;
                      return (
                        <div key={streetKey} className="border-b border-line/70 last:border-0">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
                            onClick={() => setOpenStreet(streetOpen ? null : streetKey)}
                          >
                            <span className="text-sm font-medium">{titleCaseStreet(st.street)}</span>
                            <span className="text-xs text-muted">
                              {st.households.length} houses · {st.people.length}
                            </span>
                          </button>
                          {streetOpen && (
                            <div className="bg-paper">
                              {st.households.map((house) => {
                                const head = house[0];
                                return (
                                  <div
                                    key={`${head.zip}-${head.house}-${head.street}-${head.unit}`}
                                    className="border-t border-line/70 px-4 py-3"
                                  >
                                    <p className="text-[11px] uppercase tracking-wide text-faint">
                                      {head.house} {titleCaseStreet(head.street)}
                                      {head.unit ? ` ${head.unit}` : ""}
                                    </p>
                                    <ul className="mt-1 grid gap-2">
                                      {house.map((v) => (
                                        <li key={v.id} className="grid gap-1.5">
                                          <button
                                            type="button"
                                            className="flex w-full flex-wrap items-center gap-2 py-1 text-left text-sm"
                                            onClick={() => select(v.id)}
                                          >
                                            <span className="font-medium">{fullName(v)}</span>
                                            <Badge tone={distTone(v.dist)}>{v.dist}</Badge>
                                            <Badge tone={partyTone(v.party)}>
                                              {PARTY_SHORT[v.party] ?? v.party}
                                            </Badge>
                                            <span className="text-xs text-muted">
                                              {v.age ?? "—"} · {v.pct} · {formatPhone(v.phone)}
                                            </span>
                                          </button>
                                          <InmanActions id={v.id} compact />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
          {!regions.length && loaded && (
            <p className="py-8 text-center text-sm text-muted">No streets in this filter.</p>
          )}
        </div>
        {selected && (
          <div
            className="fixed inset-0 z-40 bg-ink/40 lg:static lg:bg-transparent"
            onClick={() => select(null)}
          >
            <div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-[var(--radius-xl)] lg:static lg:max-h-none lg:rounded-[var(--radius-lg)] lg:border lg:border-line"
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


