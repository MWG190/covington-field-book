import { useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PartyBar } from "@/components/party-bar";
import { Badge, distTone } from "@/components/ui/badge";
import { COUNCIL, DISTRICTS, MAYOR, PLAN, SHAPE_NOTES, SOURCES } from "@/lib/districts";
import { pct, REGION_META } from "@/lib/format";
import type { StatsFile } from "@/lib/types";
import { turnoutTier } from "@/lib/turnout";
import { useVoterStore } from "@/lib/voter-store";
import { assetUrl } from "@/lib/asset";
import statsJson from "@/lib/stats.json";

export const Route = createFileRoute("/")({ component: Briefing });

function Briefing() {
  const load = useVoterStore((s) => s.load);
  const live = useVoterStore((s) => s.stats);
  const voters = useVoterStore((s) => s.voters);
  const stats = live ?? (statsJson as StatsFile);
  useEffect(() => {
    void load();
  }, [load]);
  const toMix = useMemo(() => {
    const c = { likely: 0, dropoff: 0, unlikely: 0 };
    for (const v of voters) c[turnoutTier(v)] += 1;
    return c;
  }, [voters]);

  const walkSheets = REGION_META.filter((r) => r.kind === "walk");
  const streetRegions = REGION_META.filter((r) => r.kind === "region");

  return (
    <div className="grid gap-10">
      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">City of Covington, Louisiana</p>
          <h1 className="display mt-2 text-4xl text-ink md:text-5xl">Council districts, Plan 2</h1>
          <p className="mt-4 max-w-prose text-[17px] text-ink-soft">
            {PLAN.name} was drawn by {PLAN.author}, dated {PLAN.dated} and posted {PLAN.posted}.
            It is the post-2020 Census remap required by the home-rule charter: five compact,
            contiguous districts of roughly equal population, plus two citywide at-large seats.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-lg)] border border-line bg-panel p-4">
          <Stat label="City area" value={PLAN.area} />
          <Stat label="Residents" value={PLAN.population} />
          <Stat label="Per district" value={PLAN.perDistrict} />
          <Stat label="Active voters" value={stats.total.toLocaleString()} />
        </div>
      </section>

      <Link
        to="/turf"
        className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-river px-4 py-4 text-river-fg"
      >
        <span>
          <span className="block text-[11px] uppercase tracking-[0.16em] text-river-fg/70">Walk Program</span>
          <span className="display mt-1 block text-2xl">Turf cutter</span>
          <span className="mt-1 block text-sm text-river-fg/80">
            Map packets of ~40 doors, then export TurfBuilder people.csv and locations.csv.
          </span>
        </span>
        <span className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-river-fg px-4 text-sm font-semibold text-river">
          Open map →
        </span>
      </Link>

      <section className="grid gap-4">
        <h2 className="display text-2xl">Official map</h2>
        <p className="max-w-prose text-ink-soft">
          The city is built around two rivers — Tchefuncte on the west/south, Bogue Falaya on the
          east — plus US 190 and Hwy 21. White on the map is outside city limits. Covington is a
          tight historic core plus irregular annexations west along US 190 and north toward Hwy
          25/437.
        </p>
        <figure className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper-2">
          <img
            src={assetUrl("maps/plan2.jpg")}
            alt="City of Covington Council Districts Plan 2, December 2022"
            className="mx-auto block h-auto w-full"
          />
          <figcaption className="flex flex-wrap gap-3 border-t border-line px-4 py-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-dist-a" /> A pale green
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-dist-b" /> B magenta
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-dist-c" /> C tan
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-dist-d" /> D light blue
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-dist-e" /> E pink
            </span>
          </figcaption>
        </figure>
      </section>

      <section className="grid gap-3">
        <h2 className="display text-2xl">How the council is built</h2>
        <p className="max-w-prose text-ink-soft">{PLAN.charter}</p>
        <p className="text-sm text-muted">
          Mayor {MAYOR.name} is elected separately. Current roster as of 2026.
        </p>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-paper-2 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2">Seat</th>
                  <th className="px-3 py-2">Member</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Contact</th>
                </tr>
              </thead>
              <tbody>
                {COUNCIL.map((c) => (
                  <tr key={c.email} className="border-t border-line">
                    <td className="px-3 py-3">
                      <div className="font-semibold">{c.seat}</div>
                      <div className="text-xs text-muted">{c.how}</div>
                    </td>
                    <td className="px-3 py-3">{c.name}</td>
                    <td className="px-3 py-3 text-ink-soft">{c.note}</td>
                    <td className="px-3 py-3 text-sm">
                      <div>{c.phone}</div>
                      <a className="text-river" href={`mailto:${c.email}`}>
                        {c.email}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {stats && (
        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="display text-2xl">Voter file, citywide</h2>
            <p className="text-xs text-muted">
              {stats.source} · {stats.generated} · {stats.city.households.toLocaleString()} households ·{" "}
              {stats.city.streets} streets
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Active registered" value={stats.total.toLocaleString()} />
            <Stat
              label="Phone on file"
              value={`${pct(stats.city.phones, stats.total)}`}
              sub={stats.city.phones.toLocaleString()}
            />
            <Stat
              label="Voted Nov 2024"
              value={pct(stats.city.voted2024, stats.total)}
              sub={stats.city.voted2024.toLocaleString()}
            />
            <Stat label="Average age" value={String(stats.city.avgAge ?? "—")} />
          </div>
          <div className="rounded-[var(--radius-lg)] border border-line bg-panel p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted">Party registration</p>
            <PartyBar stats={stats.city} />
          </div>
        </section>
      )}

      <section className="grid gap-6">
        <h2 className="display text-2xl">The five districts</h2>
        {DISTRICTS.map((d) => {
          const ds = stats?.districts[d.id];
          return (
            <article
              key={d.id}
              className="grid gap-4 rounded-[var(--radius-xl)] border border-line bg-panel p-5 md:grid-cols-[minmax(0,1fr)_220px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ background: d.colorToken }}
                    aria-hidden
                  />
                  <h3 className="display text-2xl">{d.name}</h3>
                  <Badge tone={distTone(d.id)}>{d.mapColor}</Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-river">{d.headline}</p>
                <p className="mt-3 max-w-prose text-ink-soft">{d.body}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-faint">Anchors</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {d.anchors.map((a) => (
                    <li key={a} className="rounded-full bg-paper-2 px-3 py-1 text-xs">
                      {a}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  <span>Precincts {d.precincts.join(", ")}</span>
                  {d.neighborhoods.length > 0 && (
                    <span>· Regions: {d.neighborhoods.join(", ")}</span>
                  )}
                </div>
                <Link
                  to="/voters"
                  search={{ district: d.id }}
                  className="mt-4 inline-flex h-11 items-center text-sm font-semibold text-river"
                >
                  Open {d.name} in the voter file →
                </Link>
              </div>
              {ds && (
                <div className="grid content-start gap-2 rounded-[var(--radius-md)] bg-paper p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">From the master list</p>
                  <p className="display text-3xl tabular">{ds.n.toLocaleString()}</p>
                  <p className="text-xs text-muted">registered · avg age {ds.avgAge}</p>
                  <PartyBar stats={ds} compact />
                  <p className="text-xs text-muted">
                    R {pct(ds.parties.REP ?? 0, ds.n)} · D {pct(ds.parties.DEM ?? 0, ds.n)} · N{" "}
                    {pct(ds.parties.NOPTY ?? 0, ds.n)}
                  </p>
                  <p className="text-xs text-muted">
                    {pct(ds.voted2024, ds.n)} voted Nov 2024 · {pct(ds.phones, ds.n)} have a phone
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="grid gap-4">
        <h2 className="display text-2xl">What the shapes tell you</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {SHAPE_NOTES.map((n) => (
            <article key={n.title} className="rounded-[var(--radius-lg)] border border-line bg-panel p-4">
              <h3 className="font-semibold">{n.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{n.text}</p>
            </article>
          ))}
        </div>
      </section>

      {stats && (
        <section className="grid gap-4">
          <h2 className="display text-2xl">Walk-sheet neighborhoods</h2>
          <p className="max-w-prose text-ink-soft">
            Four extra tabs in the master workbook. Opens the Walk Program — a separate door
            list from the voter file.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {walkSheets.map((meta) => {
              const ns = stats.neighborhoods[meta.name] ?? stats.regions?.[meta.name];
              if (!ns) return null;
              return (
                <Link
                  key={meta.name}
                  to="/walk"
                  search={{ neighborhood: meta.name }}
                  className="rounded-[var(--radius-lg)] border border-line bg-panel p-4 hover:bg-paper-2"
                >
                  <p className="font-semibold">{meta.name}</p>
                  <p className="mt-1 text-xs text-muted">{meta.blurb}</p>
                  <p className="mt-2 text-sm text-muted">
                    {ns.n.toLocaleString()} voters · {ns.streets} streets · precincts{" "}
                    {Object.keys(ns.precincts).join(", ")}
                  </p>
                  <PartyBar stats={ns} compact />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {stats?.regions && (
        <section className="grid gap-4">
          <h2 className="display text-2xl">Everyone else, by region</h2>
          <p className="max-w-prose text-ink-soft">
            The rest of the {stats.total.toLocaleString()} city voters — everyone not on those four
            tabs — is filed by street into the neighborhoods below. Together with the walk sheets,
            this covers the whole roll. No leftover bucket.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {streetRegions.map((meta) => {
              const ns = stats.regions?.[meta.name];
              if (!ns) return null;
              return (
                <Link
                  key={meta.name}
                  to="/walk"
                  search={{ neighborhood: meta.name }}
                  className="rounded-[var(--radius-lg)] border border-line bg-panel p-4 hover:bg-paper-2"
                >
                  <p className="font-semibold">{meta.name}</p>
                  <p className="mt-1 text-xs text-muted">{meta.blurb}</p>
                  <p className="mt-2 display text-2xl tabular">{ns.n.toLocaleString()}</p>
                  <p className="text-xs text-muted">
                    {ns.streets} streets · {ns.households.toLocaleString()} houses
                  </p>
                  <div className="mt-2">
                    <PartyBar stats={ns} compact />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-4">
        <h2 className="display text-2xl">Municipal turnout model</h2>
        <p className="max-w-prose text-ink-soft">
          National models (Clarity, GoodParty, Bluebonnet) agree: past vote is the dominant
          predictor, then age. This file only has LastVoted, not a full history, so recency is the
          stand-in. For a Covington city race a 2025 or 2026 local/special beats Nov 2024
          presidential — people who only vote president often skip municipal.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Likely"
            value={toMix.likely ? toMix.likely.toLocaleString() : "—"}
            sub="Voted 2025–26 local, especially 50+"
          />
          <Stat
            label="Drop-off"
            value={toMix.dropoff ? toMix.dropoff.toLocaleString() : "—"}
            sub="Last vote Nov 2024 or similar — ID them, GOTV later"
          />
          <Stat
            label="Unlikely"
            value={toMix.unlikely ? toMix.unlikely.toLocaleString() : "—"}
            sub="No recent vote on file"
          />
        </div>
        <p className="text-sm text-ink-soft">
          GOTV pull list = Voting Inman and likely or drop-off. Persuasion doors = Unmarked and
          likely. Unlikely voters are usually not worth a second knock unless they already ID’d.
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="display text-2xl">Turf cutter</h2>
        <p className="max-w-prose text-ink-soft">
          Walk Program now cuts packets the way TurfBuilder does: street-contiguous households
          inside a neighborhood, about 40 doors each, on a Covington map. Export people.csv and
          locations.csv in TurfBuilder’s columns, or open the same packet as a door list.
        </p>
        <Link
          to="/turf"
          className="inline-flex h-11 w-fit items-center rounded-[var(--radius-sm)] bg-river px-4 text-sm font-semibold text-river-fg"
        >
          Open the turf cutter →
        </Link>
      </section>

      <section className="grid gap-4">
        <h2 className="display text-2xl">Free canvassing stack</h2>
        <p className="max-w-prose text-ink-soft">
          MiniVAN and PDI are free only if a party committee already pays for the voter file. For
          an independent Covington program, this Field Book plus CSV is the working file. Export
          from the voter list and load it into any of the tools below.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {INTEGRATIONS.map((item) => (
            <article key={item.name} className="rounded-[var(--radius-lg)] border border-line bg-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{item.name}</h3>
                <span className="text-[11px] uppercase tracking-wide text-faint">{item.cost}</span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{item.text}</p>
              {item.href === "/turf" ? (
                <Link to="/turf" className="mt-3 inline-flex items-center gap-1.5 text-sm text-river">
                  {item.link}
                </Link>
              ) : item.href.startsWith("/") ? (
                <Link to="/voters" className="mt-3 inline-flex items-center gap-1.5 text-sm text-river">
                  {item.link}
                </Link>
              ) : (
                <a
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-river"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.link}
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-2 border-t border-line pt-6">
        <h2 className="display text-xl">Sources</h2>
        <ul className="grid gap-1 text-sm">
          {SOURCES.map((s) => (
            <li key={s.href}>
              <a className="inline-flex items-center gap-1.5 text-river" href={s.href} target="_blank" rel="noreferrer">
                {s.label}
                <ExternalLink className="size-3.5" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-prose text-xs text-faint">
          Voter marks and notes stay in this browser only. The registration file is the St. Tammany
          extract loaded into this book — every column from the workbook, including race, zip+4,
          school board, house, senate, police jury, RSCC/DSCC, and the neighborhood tabs.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="display text-2xl tabular">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

const INTEGRATIONS = [
  {
    name: "This Field Book → CSV",
    cost: "Free",
    text: "Export the current tab (Inman IDs, yard signs, GOTV, turnout score). Same columns MiniVAN paper lists and Ecanvasser CSV import expect: name, address, phone, precinct, support, result.",
    href: "/voters",
    link: "Open the voter file",
  },
  {
    name: "Ecanvasser",
    cost: "Free tier",
    text: "VAN-independent door app. CSV/CRM import, turf, offline. Best paid-adjacent option if you outgrow this Walk Program. Salesforce / NationBuilder / L2 connectors if you ever buy a file.",
    href: "https://www.ecanvasser.com",
    link: "ecanvasser.com",
  },
  {
    name: "Google Sheets + My Maps",
    cost: "Free",
    text: "Paste the CSV, share a tab per turf. Fine for a handful of walkers. No offline script, no live IDs.",
    href: "https://www.google.com/maps/d/",
    link: "Google My Maps",
  },
  {
    name: "KoBoToolbox / ODK",
    cost: "Free / open source",
    text: "If you need a structured door survey (issues, yard sign size) beyond Inman ID. Import this file as CSV pulldata, collect on phones offline, export back.",
    href: "https://www.kobotoolbox.org",
    link: "kobotoolbox.org",
  },
  {
    name: "MiniVAN (NGP VAN)",
    cost: "Free with VAN",
    text: "Louisiana Democratic coordinated campaigns get this through the state party. Independent / Inman city races usually do not. If you get a committee VAN login, export this file is not a live sync — VAN is its own voter file.",
    href: "https://www.ngpvan.com",
    link: "ngpvan.com",
  },
  {
    name: "PDI 360",
    cost: "Paid file",
    text: "Republican/nonpartisan counterpart to VAN. Same story: useful if a parish committee already seats you. Not a free import of this St. Tammany extract.",
    href: "https://politicaldata.com",
    link: "politicaldata.com",
  },
  {
    name: "TurfBuilder",
    cost: "Open source",
    text: "people.csv + locations.csv match TurfBuilder’s import. Cut packets here on the Covington map (Census street points), then walk them in Door lists or load the CSVs into TurfBuilder.",
    href: "/turf",
    link: "Open the turf cutter",
  },
  {
    name: "CampaignKnock / Reach",
    cost: "Free tiers",
    text: "CampaignKnock: small-race mobile canvass, CSV in. Reach: relational organizing (friends-and-neighbors), not a walk list. Use Reach on top of IDs from this book, not instead of it.",
    href: "https://reach.vote",
    link: "reach.vote",
  },
];
