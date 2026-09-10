import { create } from "zustand";
import type { InmanVote, ListTab, Mark, MarkStatus, StatsFile, TurnoutFilter, Voter } from "./types";
import { csvEscape, fullName, householdKey } from "./format";
import { isGotvTarget, turnoutScore, turnoutTier } from "./turnout";
import { assetUrl } from "./asset";

const MARKS_KEY = "cov-field-book-marks-v1";
const DATA_VER = "4";

type Filters = {
  q: string;
  district: string;
  precinct: string;
  party: string;
  neighborhood: string;
  race: string;
  sex: string;
  phone: "any" | "yes" | "no";
  voted2024: "any" | "yes" | "no";
  mark: "any" | MarkStatus;
  listTab: ListTab;
  turnout: TurnoutFilter;
};

const defaultFilters: Filters = {
  q: "",
  district: "",
  precinct: "",
  party: "",
  neighborhood: "",
  race: "",
  sex: "",
  phone: "any",
  voted2024: "any",
  mark: "any",
  listTab: "all",
  turnout: "any",
};

function emptyMark(): Mark {
  return {
    status: "uncontacted",
    note: "",
    updated: new Date().toISOString(),
    inman: "",
    yard: false,
  };
}

function normalizeMark(raw: Partial<Mark> | undefined): Mark {
  return {
    status: raw?.status ?? "uncontacted",
    note: raw?.note ?? "",
    updated: raw?.updated ?? "",
    inman: raw?.inman === "yes" || raw?.inman === "no" ? raw.inman : "",
    yard: Boolean(raw?.yard),
  };
}

function loadMarks(): Record<string, Mark> {
  try {
    const raw = localStorage.getItem(MARKS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<Mark>>;
    const out: Record<string, Mark> = {};
    for (const [id, m] of Object.entries(parsed)) out[id] = normalizeMark(m);
    return out;
  } catch {
    return {};
  }
}

function matches(v: Voter, f: Filters, marks: Record<string, Mark>) {
  if (f.district && v.dist !== f.district) return false;
  if (f.precinct && v.pct !== f.precinct) return false;
  if (f.party && v.party !== f.party) return false;
  if (f.neighborhood && v.region !== f.neighborhood && !v.nb.includes(f.neighborhood))
    return false;
  if (f.race && v.race !== f.race) return false;
  if (f.sex && v.sex !== f.sex) return false;
  if (f.phone === "yes" && !v.phone) return false;
  if (f.phone === "no" && v.phone) return false;
  if (f.voted2024 === "yes" && !v.lv.startsWith("2024-11")) return false;
  if (f.voted2024 === "no" && v.lv.startsWith("2024-11")) return false;
  if (f.mark !== "any") {
    const st = marks[v.id]?.status ?? "uncontacted";
    if (st !== f.mark) return false;
  }
  const mk = marks[v.id];
  if (f.listTab === "unmarked" && mk?.inman) return false;
  if (f.listTab === "inman" && mk?.inman !== "yes") return false;
  if (f.listTab === "not-inman" && mk?.inman !== "no") return false;
  if (f.listTab === "nothome" && mk?.status !== "not-home") return false;
  if (f.listTab === "yard" && !mk?.yard) return false;
  if (f.listTab === "gotv" && !(mk?.inman === "yes" && isGotvTarget(v))) return false;
  if (f.turnout !== "any" && turnoutTier(v) !== f.turnout) return false;
  if (f.q) {
    const q = f.q.trim().toUpperCase().replace(/\s+/g, " ");
    const blob =
      `${v.fn} ${v.mn} ${v.ln} ${v.addr} ${v.phone} ${v.id} ${v.street} ${v.pct} ${v.region} ${v.nb.join(" ")}`.toUpperCase();
    if (!blob.includes(q)) return false;
  }
  return true;
}

type SortKey = "name" | "addr" | "pct" | "dist" | "party" | "age" | "lv" | "walk" | "region" | "turnout";

type Store = {
  voters: Voter[];
  stats: StatsFile | null;
  loaded: boolean;
  error: string | null;
  dataVer: string;
  marks: Record<string, Mark>;
  filters: Filters;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
  selectedId: string | null;
  load: () => Promise<void>;
  setFilter: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
  resetFilters: () => void;
  setSort: (k: SortKey) => void;
  setPage: (n: number) => void;
  select: (id: string | null) => void;
  setMark: (id: string, status: MarkStatus, note?: string) => void;
  setInman: (id: string, vote: InmanVote) => void;
  setYard: (id: string, yard?: boolean) => void;
  tabCounts: () => {
    all: number;
    unmarked: number;
    inman: number;
    notInman: number;
    nothome: number;
    yard: number;
    gotv: number;
  };
  filtered: () => Voter[];
  exportCsv: (rows: Voter[]) => void;
};

function persistMarks(marks: Record<string, Mark>) {
  localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
}

function patchMark(prev: Mark | undefined, patch: Partial<Mark>): Mark {
  return {
    ...emptyMark(),
    ...prev,
    ...patch,
    updated: new Date().toISOString(),
  };
}

function sortVoters(rows: Voter[], key: SortKey, dir: "asc" | "desc") {
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    switch (key) {
      case "name":
        av = `${a.ln} ${a.fn}`;
        bv = `${b.ln} ${b.fn}`;
        break;
      case "addr":
        av = `${a.street} ${a.house}`;
        bv = `${b.street} ${b.house}`;
        break;
      case "pct":
        av = a.pct;
        bv = b.pct;
        break;
      case "dist":
        av = a.dist;
        bv = b.dist;
        break;
      case "party":
        av = a.party;
        bv = b.party;
        break;
      case "age":
        av = a.age ?? 0;
        bv = b.age ?? 0;
        break;
      case "lv":
        av = a.lv;
        bv = b.lv;
        break;
      case "walk":
        av = a.walk ?? 0;
        bv = b.walk ?? 0;
        break;
      case "region":
        av = a.region ?? "";
        bv = b.region ?? "";
        break;
      case "turnout":
        av = turnoutScore(a);
        bv = turnoutScore(b);
        break;
    }
    if (av < bv) return -1 * m;
    if (av > bv) return 1 * m;
    return `${a.ln} ${a.fn}`.localeCompare(`${b.ln} ${b.fn}`);
  });
}

export const useVoterStore = create<Store>((set, get) => ({
  voters: [],
  stats: null,
  loaded: false,
  error: null,
  dataVer: "",
  marks: {},
  filters: defaultFilters,
  sortKey: "addr",
  sortDir: "asc",
  page: 0,
  pageSize: 50,
  selectedId: null,
  load: async () => {
    if (get().dataVer === DATA_VER && get().voters.length) return;
    try {
      const [vr, sr] = await Promise.all([
        fetch(`${assetUrl("data/voters.json")}?v=${DATA_VER}`),
        fetch(`${assetUrl("data/stats.json")}?v=${DATA_VER}`),
      ]);
      if (!vr.ok) throw new Error("Could not load voter file");
      const voters = (await vr.json()) as Voter[];
      const stats = (await sr.json()) as StatsFile;
      set({
        voters,
        stats,
        loaded: true,
        dataVer: DATA_VER,
        marks: typeof window === "undefined" ? {} : loadMarks(),
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Load failed", loaded: true });
    }
  },
  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v }, page: 0 })),
  resetFilters: () => set({ filters: defaultFilters, page: 0 }),
  setSort: (k) =>
    set((s) => ({
      sortKey: k,
      sortDir: s.sortKey === k && s.sortDir === "asc" ? "desc" : "asc",
      page: 0,
    })),
  setPage: (n) => set({ page: n }),
  select: (id) => set({ selectedId: id }),
  setMark: (id, status, note) => {
    const prev = get().marks[id];
    const marks = {
      ...get().marks,
      [id]: patchMark(prev, { status, note: note ?? prev?.note ?? "" }),
    };
    persistMarks(marks);
    set({ marks });
  },
  setInman: (id, vote) => {
    const prev = get().marks[id];
    const inman: InmanVote = prev?.inman === vote ? "" : vote;
    const marks = { ...get().marks, [id]: patchMark(prev, { inman }) };
    persistMarks(marks);
    set({ marks });
  },
  setYard: (id, yard) => {
    const prev = get().marks[id];
    const next = yard ?? !prev?.yard;
    const marks = { ...get().marks, [id]: patchMark(prev, { yard: next }) };
    persistMarks(marks);
    set({ marks });
  },
  tabCounts: () => {
    const { voters, filters, marks } = get();
    const base = { ...filters, listTab: "all" as const };
    let all = 0;
    let unmarked = 0;
    let inman = 0;
    let notInman = 0;
    let nothome = 0;
    let yard = 0;
    let gotv = 0;
    for (const v of voters) {
      if (!matches(v, base, marks)) continue;
      all += 1;
      const mk = marks[v.id];
      if (!mk?.inman) unmarked += 1;
      if (mk?.inman === "yes") {
        inman += 1;
        if (isGotvTarget(v)) gotv += 1;
      }
      if (mk?.inman === "no") notInman += 1;
      if (mk?.status === "not-home") nothome += 1;
      if (mk?.yard) yard += 1;
    }
    return { all, unmarked, inman, notInman, nothome, yard, gotv };
  },
  filtered: () => {
    const { voters, filters, marks, sortKey, sortDir } = get();
    return sortVoters(
      voters.filter((v) => matches(v, filters, marks)),
      sortKey,
      sortDir,
    );
  },
  exportCsv: (rows) => {
    const marks = get().marks;
    const headers = [
      "District",
      "Precinct",
      "Region",
      "WalkSheet",
      "Last",
      "First",
      "Middle",
      "Address",
      "Address2",
      "Unit",
      "City",
      "State",
      "Zip",
      "Zip4",
      "Party",
      "Age",
      "Sex",
      "Race",
      "Phone",
      "LastVoted",
      "Registered",
      "Status",
      "WalkOrder",
      "SchoolBoard",
      "House",
      "Senate",
      "PoliceJury",
      "Congress",
      "BESE",
      "RSCC",
      "DSCC",
      "TaxCommission",
      "Recreation",
      "Appeals",
      "DistrictCourt",
      "JP",
      "PSC",
      "SupremeCourt",
      "TaxWard",
      "TurnoutScore",
      "TurnoutTier",
      "VotingInman",
      "YardSign",
      "Mark",
      "Note",
      "RegNum",
    ];
    const lines = [headers.join(",")];
    for (const v of rows) {
      const mk = marks[v.id];
      const inman =
        mk?.inman === "yes" ? "Voting Inman" : mk?.inman === "no" ? "Not Voting Inman" : "";
      lines.push(
        [
          v.dist,
          v.pct,
          v.region ?? "",
          (v.nb ?? []).join("; "),
          v.ln,
          v.fn,
          v.mn,
          v.addr,
          v.addr2 ?? "",
          v.unit,
          v.city,
          v.st,
          v.zip,
          v.zip4 ?? "",
          v.party,
          String(v.age ?? ""),
          v.sex,
          v.race,
          v.phone,
          v.lv,
          v.rd,
          v.status ?? "",
          String(v.walk ?? ""),
          v.sb ?? "",
          v.hd ?? "",
          v.sen ?? "",
          v.pj ?? "",
          v.cd ?? "",
          v.bese ?? "",
          v.rscc ?? "",
          v.dscc ?? "",
          v.taxc ?? "",
          v.rec ?? "",
          v.ac ?? "",
          v.dc ?? "",
          v.jp ?? "",
          v.psc ?? "",
          v.sc ?? "",
          v.tw ?? "",
          String(turnoutScore(v)),
          turnoutTier(v),
          inman,
          mk?.yard ? "Yes" : "",
          mk?.status ?? "uncontacted",
          mk?.note ?? "",
          v.id,
        ]
          .map((x) => csvEscape(String(x)))
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `covington-voters-${rows.length}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));

export function groupWalk(rows: Voter[]) {
  const streets = new Map<string, Voter[]>();
  for (const v of rows) {
    const key = v.street || "(No street)";
    const list = streets.get(key) ?? [];
    list.push(v);
    streets.set(key, list);
  }
  const out = [...streets.entries()].map(([street, people]) => {
    people.sort((a, b) => {
      const ah = parseInt(a.house, 10) || 0;
      const bh = parseInt(b.house, 10) || 0;
      if (ah !== bh) return ah - bh;
      return fullName(a).localeCompare(fullName(b));
    });
    const houses = new Map<string, Voter[]>();
    for (const p of people) {
      const k = householdKey(p);
      const list = houses.get(k) ?? [];
      list.push(p);
      houses.set(k, list);
    }
    return { street, people, households: [...houses.values()] };
  });
  out.sort((a, b) => a.street.localeCompare(b.street));
  return out;
}

export function groupWalkRegions(rows: Voter[]) {
  const by = new Map<string, Voter[]>();
  for (const v of rows) {
    const k = v.region || "Other";
    const list = by.get(k) ?? [];
    list.push(v);
    by.set(k, list);
  }
  return [...by.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([region, people]) => ({
      region,
      people,
      streets: groupWalk(people),
    }));
}

export type { Filters, SortKey };
