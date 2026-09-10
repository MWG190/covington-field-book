import type { Party, Voter } from "./types";

export const PARTY_LABEL: Record<string, string> = {
  REP: "Republican",
  DEM: "Democrat",
  NOPTY: "No party",
  LBT: "Libertarian",
  GRN: "Green",
  OTHER: "Other",
};

export const PARTY_SHORT: Record<string, string> = {
  REP: "R",
  DEM: "D",
  NOPTY: "N",
  LBT: "L",
  GRN: "G",
  OTHER: "O",
};

export const RACE_LABEL: Record<string, string> = {
  W: "White",
  B: "Black",
  H: "Hispanic",
  A: "Asian",
  I: "American Indian",
  O: "Other",
};

export const SEX_LABEL: Record<string, string> = {
  F: "Female",
  M: "Male",
  U: "Unknown",
};

export type RegionMeta = {
  name: string;
  kind: "walk" | "region";
  blurb: string;
};

export const REGION_META: RegionMeta[] = [
  {
    name: "River Forest",
    kind: "walk",
    blurb: "Workbook tab. Lurline, Karen, Beth, Patricia and adjoining C01 streets west of downtown.",
  },
  {
    name: "Oak Alley",
    kind: "walk",
    blurb: "Workbook tabs Oak Alley + Pt.2. Dominic, Orchard, Darlene, Oak Alley Blvd — Dist C, precinct C11.",
  },
  {
    name: "Barkley Park",
    kind: "walk",
    blurb: "Workbook tab. Woodsprings, Autumn Woods, Woodburne, Somerset, Millstone, Barkley Blvd.",
  },
  {
    name: "District D SW",
    kind: "walk",
    blurb: "Workbook tab Dist.D S.W. Menetre Drive in District D.",
  },
  {
    name: "Pine Crest / Parkview",
    kind: "region",
    blurb: "North-central Dist A pocket: Pine Crest, Parkview, Emily Diamond, the alleys off 32nd.",
  },
  {
    name: "North grid",
    kind: "region",
    blurb: "Numbered west avenues 24th–34th and the north-lettered streets. District A spine.",
  },
  {
    name: "Covington Point",
    kind: "region",
    blurb: "Knoll Pine, Branch Crossing, Covington Point, Carriage Pines, Ozone Park — Dist B northeast.",
  },
  {
    name: "Fairgrounds / east side",
    kind: "region",
    blurb: "Sumner, Wharton, St Williams, MLK, Village Walk, Cherokee, and the east numbered avenues.",
  },
  {
    name: "Reagan / Hwy 190",
    kind: "region",
    blurb: "Ronald Reagan Highway frontage and the Rue St Martin / St Louis pocket, Dist B C11.",
  },
  {
    name: "Natchez / Lakewood",
    kind: "region",
    blurb: "Natchez Loop, Savannah, Darlington, Inspiration, Lakewood Northshore — Dist D C03.",
  },
  {
    name: "West-central avenues",
    kind: "region",
    blurb: "W 12th–23rd, Presidents, Madison / Filmore, hospital corridor. District D.",
  },
  {
    name: "Historic core",
    kind: "region",
    blurb: "South lettered streets and east numbered avenues — Division of St. John, Dist E.",
  },
  {
    name: "Old Landing / river",
    kind: "region",
    blurb: "Old Landing, Cypress, Riverbend, Bogue Falaya, Bennett — the river point.",
  },
  {
    name: "Mile Branch",
    kind: "region",
    blurb: "Mile Branch Court, Brooke Hollow, Hummuck — Dist E west of the historic grid.",
  },
  {
    name: "PO Box / mail",
    kind: "region",
    blurb: "Registered at a post-office box. Use phone, not a walk list.",
  },
  {
    name: "Out of town",
    kind: "region",
    blurb: "Mail city is not Covington. Still on the city voter roll.",
  },
];

export const REGIONS = REGION_META.map((r) => r.name);
export const WALK_SHEETS = REGION_META.filter((r) => r.kind === "walk").map((r) => r.name);

export function partyLabel(p: Party) {
  return PARTY_LABEL[p] ?? p;
}

export function raceLabel(r: string) {
  return RACE_LABEL[r] ?? r ?? "—";
}

export function sexLabel(s: string) {
  return SEX_LABEL[s] ?? s ?? "—";
}

export function fullName(v: Pick<Voter, "fn" | "mn" | "ln">) {
  return [v.fn, v.mn, v.ln].filter(Boolean).join(" ");
}

export function formatPhone(raw: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1"))
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return raw || "—";
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${m}/${d}/${y}`;
}

export function votedIn(iso: string, year: string) {
  return iso.startsWith(year);
}

export function pct(n: number, d: number) {
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

export function householdKey(v: Pick<Voter, "zip" | "house" | "street">) {
  return `${v.zip}|${v.house}|${v.street}`;
}

export function titleCaseStreet(s: string) {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bDr\b/g, "Dr")
    .replace(/\bSt\b/g, "St")
    .replace(/\bAve\b/g, "Ave")
    .replace(/\bLn\b/g, "Ln")
    .replace(/\bCt\b/g, "Ct")
    .replace(/\bCir\b/g, "Cir")
    .replace(/\bBlvd\b/g, "Blvd")
    .replace(/\bHwy\b/g, "Hwy")
    .replace(/\bPo Box\b/g, "PO Box")
    .replace(/\bPo\b/g, "PO");
}

export function zipLine(v: Pick<Voter, "city" | "st" | "zip" | "zip4">) {
  const z = v.zip4 ? `${v.zip}-${v.zip4}` : v.zip;
  return [v.city, v.st, z].filter(Boolean).join(" ");
}

export function csvEscape(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replaceAll('"', '""')}"`;
  }
  return v;
}
