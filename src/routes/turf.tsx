import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, MapPinned } from "lucide-react";
import { FilterBar } from "@/components/filter-bar";
import { TurfMap } from "@/components/turf-map";
import { Button } from "@/components/ui/button";
import { VoterTabs } from "@/components/voter-tabs";
import { titleCaseStreet, WALK_SHEETS } from "@/lib/format";
import { loadStreetGeo, type StreetGeo } from "@/lib/geo";
import { cutTurfs, PACKET_SIZES, turfColor, type TurfPacket } from "@/lib/turf-cut";
import {
  exportTurfBuilderLocations,
  exportTurfBuilderPeople,
  exportTurfGeoJson,
  exportTurfPackets,
} from "@/lib/turfbuilder-export";
import { useVoterStore } from "@/lib/voter-store";

type TurfSearch = { neighborhood?: string; district?: string };

export const Route = createFileRoute("/turf")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): TurfSearch => ({
    neighborhood: typeof s.neighborhood === "string" ? s.neighborhood : undefined,
    district: typeof s.district === "string" ? s.district : undefined,
  }),
  component: TurfPage,
});

function TurfPage() {
  const search = Route.useSearch();
  const load = useVoterStore((s) => s.load);
  const loaded = useVoterStore((s) => s.loaded);
  const setFilter = useVoterStore((s) => s.setFilter);
  const voters = useVoterStore((s) => s.voters);
  const filters = useVoterStore((s) => s.filters);
  const marks = useVoterStore((s) => s.marks);

  const [geo, setGeo] = useState<StreetGeo>({});
  const [doorsPer, setDoorsPer] = useState<number>(40);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadStreetGeo().then(setGeo);
  }, []);

  useEffect(() => {
    setFilter("neighborhood", search.neighborhood ?? "");
    setFilter("district", search.district ?? "");
  }, [search.neighborhood, search.district, setFilter]);

  const rows = useMemo(() => useVoterStore.getState().filtered(), [voters, filters, marks, loaded]);
  const packets = useMemo(() => cutTurfs(rows, geo, doorsPer), [rows, geo, doorsPer]);
  const selected: TurfPacket | undefined = packets.find((p) => p.id === selectedId);

  useEffect(() => {
    if (selectedId && !packets.some((p) => p.id === selectedId)) setSelectedId(null);
  }, [packets, selectedId]);

  const doorTotal = packets.reduce((n, p) => n + p.doors, 0);
  const voterTotal = packets.reduce((n, p) => n + p.voters, 0);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">TurfBuilder schema</p>
        <h1 className="display mt-1 text-3xl">Turf cutter</h1>
        <p className="mt-1 max-w-prose text-sm text-ink-soft">
          Street-contiguous packets of about {doorsPer} doors. Export TurfBuilder people.csv and
          locations.csv, or walk a packet in Door lists.
        </p>
      </div>

      <VoterTabs />

      <div className="flex flex-wrap gap-1.5">
        {WALK_SHEETS.map((name) => {
          const active = filters.neighborhood === name;
          return (
            <Link
              key={name}
              to="/turf"
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
          to="/turf"
          search={{}}
          onClick={() => setFilter("neighborhood", "")}
          className={`inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold ${
            !filters.neighborhood ? "bg-ink text-paper" : "bg-paper-2 text-ink-soft"
          }`}
        >
          All regions
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-faint">Doors per packet</span>
        {PACKET_SIZES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setDoorsPer(n)}
            className={`inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold ${
              doorsPer === n ? "bg-river text-river-fg" : "bg-paper-2 text-ink-soft"
            }`}
          >
            {n}
          </button>
        ))}
        <p className="ml-auto text-xs text-muted">
          {packets.length} packets · {doorTotal.toLocaleString()} doors · {voterTotal.toLocaleString()}{" "}
          voters
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.85fr)]">
        <TurfMap
          packets={packets}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          rows={rows}
          geo={geo}
        />
        <div className="grid content-start gap-3">
          {selected ? (
            <article className="rounded-[var(--radius-lg)] border border-line bg-panel p-4">
              <p className="text-[11px] uppercase tracking-wide text-faint">{selected.id}</p>
              <h2 className="display mt-1 text-xl">{selected.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {selected.doors} doors · {selected.voters} voters · {selected.streets.length}{" "}
                {selected.streets.length === 1 ? "street" : "streets"}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {selected.streets.map((s) => (
                  <li key={s} className="rounded-full bg-paper-2 px-2.5 py-1 text-xs">
                    {titleCaseStreet(s)}
                  </li>
                ))}
              </ul>
              <Link
                to="/walk"
                search={{ neighborhood: selected.region }}
                className="mt-4 inline-flex h-11 items-center gap-2 text-sm font-semibold text-river"
              >
                <MapPinned className="size-4" />
                Walk {selected.region}
              </Link>
            </article>
          ) : (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-panel px-4 py-6 text-sm text-muted">
              Click a packet on the map or in the list. Each color is one walk.
            </p>
          )}
          <div className="max-h-[min(52vh,480px)] overflow-auto rounded-[var(--radius-lg)] border border-line bg-panel">
            {!loaded ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Cutting packets…</p>
            ) : (
              packets.map((p, i) => {
              const on = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(on ? null : p.id)}
                  className={`flex w-full items-start gap-3 border-b border-line/70 px-3 py-3 text-left last:border-0 ${
                    on ? "bg-paper-2" : "hover:bg-paper"
                  }`}
                >
                  <span
                    className="mt-1 size-2.5 shrink-0 rounded-full"
                    style={{ background: turfColor(i) }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {p.id} · {p.region}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {p.streets.length === 1
                        ? titleCaseStreet(p.streets[0] ?? "")
                        : `${p.streets.length} streets`}{" "}
                      · {p.doors} doors · {p.voters} voters
                    </span>
                  </span>
                </button>
              );
            }))}
            {loaded && !packets.length && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                No walkable doors in this filter. PO boxes and out-of-town mail are skipped.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="ink"
          type="button"
          disabled={!rows.length}
          onClick={() => exportTurfBuilderPeople(rows)}
        >
          <Download className="size-4" />
          people.csv
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={!rows.length}
          onClick={() => exportTurfBuilderLocations(rows, geo)}
        >
          <Download className="size-4" />
          locations.csv
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={!packets.length}
          onClick={() => exportTurfPackets(rows, packets, marks, geo)}
        >
          <Download className="size-4" />
          Packet CSV
        </Button>
        <Button
          variant="ghost"
          type="button"
          disabled={!packets.length}
          onClick={() => exportTurfGeoJson(rows, packets, geo)}
        >
          GeoJSON
        </Button>
      </div>

      <FilterBar rows={rows} />
    </div>
  );
}
