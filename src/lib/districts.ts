import type { DistrictId } from "./types";

export type CouncilSeat = {
  seat: string;
  how: string;
  name: string;
  note: string;
  phone: string;
  email: string;
  address: string;
};

export const COUNCIL: CouncilSeat[] = [
  {
    seat: "District A",
    how: "Voters in A only",
    name: "John Callahan",
    note: "Interim; appointed Feb 2026 after Peter Lewis Sr.",
    phone: "(985) 264-6767",
    email: "jcallahan@covla.com",
    address: "",
  },
  {
    seat: "District B",
    how: "Voters in B only",
    name: "Blake Bushnell",
    note: "Won March 2025 special election (58%). Northeastern section.",
    phone: "(985) 400-1391",
    email: "bbushnell@covla.com",
    address: "508 Buckthorne Place",
  },
  {
    seat: "District C",
    how: "Voters in C only",
    name: "Joey Roberts",
    note: "West side / Covington High corridor.",
    phone: "(985) 705-2020",
    email: "jroberts@covla.com",
    address: "13 Michelle Drive",
  },
  {
    seat: "District D",
    how: "Voters in D only",
    name: "Jimmy Inman",
    note: "Hospital / Hwy 21 corridor.",
    phone: "(985) 801-9750",
    email: "jinman@covla.com",
    address: "617 Lakewood Northshore Drive",
  },
  {
    seat: "District E",
    how: "Voters in E only",
    name: "Todd Burrall",
    note: "Historic south / river peninsula.",
    phone: "(985) 264-8335",
    email: "tburrall@covla.com",
    address: "831 S. New Hampshire St.",
  },
  {
    seat: "At-large",
    how: "Whole city",
    name: "Mark Verret",
    note: "Council President.",
    phone: "(504) 615-9655",
    email: "mverret@covla.com",
    address: "250 S. Jahncke Avenue",
  },
  {
    seat: "At-large",
    how: "Whole city",
    name: "John Botsford",
    note: "Council Vice President. Previously District B.",
    phone: "(985) 273-1030",
    email: "jbotsford@covla.com",
    address: "257 Knoll Pine Circle",
  },
];

export const MAYOR = {
  name: "Mark R. Johnson",
  title: "Mayor",
};

export type DistrictBrief = {
  id: DistrictId;
  name: string;
  colorToken: string;
  mapColor: string;
  headline: string;
  body: string;
  anchors: string[];
  precincts: string[];
  neighborhoods: string[];
};

export const DISTRICTS: DistrictBrief[] = [
  {
    id: "A",
    name: "District A",
    colorToken: "var(--color-dist-a)",
    mapColor: "Pale green",
    headline: "North-central grid",
    body: "Runs through the numbered-avenue grid north of the US 190 business loop. Mid-density residential plus city rec land — not the historic riverfront and not the far-west subdivisions. Sits between C on the west and B on the east, north of D. By registration this is the only majority-Democrat district in the city.",
    anchors: ["Covington Recreation Complex", "St. Tammany Parish Jail"],
    precincts: ["C06", "C07", "C08", "C03"],
    neighborhoods: ["North grid", "Pine Crest / Parkview"],
  },
  {
    id: "B",
    name: "District B",
    colorToken: "var(--color-dist-b)",
    mapColor: "Magenta",
    headline: "Northeast + civic edge",
    body: "The only district local press has described in words: the northeastern section. Reaches the civic cluster around the Justice Center, police, fire, and Trailhead, plus Lyon Elementary and the Fairgrounds along Point Canal / Ozone Branch / Edward’s Creek. Mixes older east-side blocks with newer northeast annexations.",
    anchors: [
      "Lyon Elementary",
      "Covington Fairgrounds",
      "Justice Center",
      "Trailhead",
    ],
    precincts: ["C09", "C08", "C11"],
    neighborhoods: ["Covington Point", "Fairgrounds / east side", "Reagan / Hwy 190"],
  },
  {
    id: "C",
    name: "District C",
    colorToken: "var(--color-dist-c)",
    mapColor: "Tan / orange",
    headline: "West side",
    body: "Largest land area. Covington High School and the River Forest / Patricia Canal neighborhoods west of downtown, plus a second lobe north of US 190 along Blue Swamp Creek. Council video treats property in front of Oakhaven Meadows — right before Covington High — as District C. Suburban-west fabric: highway frontage and post-war subdivisions. Strongest Republican registration in the city.",
    anchors: ["Covington High School", "River Forest", "Patricia Canal"],
    precincts: ["C01", "C11", "C06"],
    neighborhoods: ["River Forest", "Oak Alley", "Barkley Park"],
  },
  {
    id: "D",
    name: "District D",
    colorToken: "var(--color-dist-d)",
    mapColor: "Light blue",
    headline: "West-central / hospital corridor",
    body: "Band along Hwy 21 and Mile Branch. St. Tammany Parish Hospital sits here. Mid-city slice between the west-side subdivisions (C) and the historic south (E). Daytime population is inflated by the hospital; city financial reports note the parish seat and hospital push daytime population toward ~20,000 even though residents are ~11,600.",
    anchors: ["St. Tammany Parish Hospital", "Mile Branch", "Hwy 21"],
    precincts: ["C03", "C02", "C07", "C06"],
    neighborhoods: ["Natchez / Lakewood", "West-central avenues", "District D SW"],
  },
  {
    id: "E",
    name: "District E",
    colorToken: "var(--color-dist-e)",
    mapColor: "Pink",
    headline: "South historic core and river point",
    body: "Pink strip between the Tchefuncte and Bogue Falaya, then north along the Bogue Falaya parks. This is the Division of St. John historic district — ox-lot plan, National Register historic core — plus southern residential streets toward the confluence. Councilman Burrall’s address on S. New Hampshire sits in this south grid.",
    anchors: [
      "St. Paul’s School",
      "St. Scholastica Academy",
      "Menetre Park / boat launch",
      "Bogue Falaya Park",
      "Columbia Street Landing",
    ],
    precincts: ["C04", "C02", "C08"],
    neighborhoods: ["Historic core", "Old Landing / river", "Mile Branch"],
  },
];

export const SHAPE_NOTES = [
  {
    title: "Rivers do more work than precinct lines",
    text: "E is almost a peninsula defined by water. D uses Mile Branch. C’s west edge follows canals and the Tchefuncte. That is more compact than it first looks.",
  },
  {
    title: "Highways are the internal seams",
    text: "US 190 (east–west) and Hwy 21 (north–south) are the spines. A and B sit mostly north of the 190 business couplet; D and E sit south of it; C straddles 190 on the west.",
  },
  {
    title: "Plan 2 is not a precinct plan",
    text: "Parish voting precincts (C01, C02, C06…) are a different layer. A council district can contain pieces of several precincts, and a precinct can be split by a district line. City district on the voter card is the field that matters for municipal races.",
  },
  {
    title: "Compactness is uneven",
    text: "D and A are the most regular. E is long and thin because of the river confluence. C is the awkward one: two lobes connected through the US 190 / high-school corridor — typical of a city that annexed west along the highway after the historic core was already built.",
  },
  {
    title: "Civic buildings are not all in one district",
    text: "Jail and rec complex → A. Fairgrounds and Lyon → B. High school → C. Hospital → D. St. Paul’s / parks / landing → E. City Hall, Justice Center, and Trailhead sit on the A–B–D–E hinge downtown.",
  },
];

export const PLAN = {
  name: "Plan 2",
  author: "City Engineering/GIS (M. Dalrymple)",
  dated: "December 2022",
  posted: "January 2023",
  area: "8.2 square miles",
  population: "~11,700 residents",
  perDistrict: "~2,300 residents",
  charter:
    "Home-rule charter (1978). Mayor-council. Four-year terms, two consecutive term limit. Five compact, contiguous districts of roughly equal population plus two citywide at-large seats. District members must live in the district for six months before qualifying. After each census the council must redraw at least six months before the next council election. Annexations are assigned to a district in the annexation ordinance.",
};

export const SOURCES = [
  {
    label: "Plan 2 council map",
    href: "https://www.covla.com/wp-content/uploads/2023/02/Covington-Council-Districts-PLAN-2-24-X-36.pdf",
  },
  {
    label: "Plan 2 with precincts",
    href: "https://www.covla.com/wp-content/uploads/2023/02/Covington-Council-Districts-PLAN-2-and-PRECINCTS-24-X-36.pdf",
  },
  {
    label: "City GIS viewer",
    href: "https://covingtonla.maps.arcgis.com/apps/webappviewer/index.html?id=c34cc87e836b45b39cd699d6cb79b4fa",
  },
  { label: "GeauxVote", href: "https://voterportal.sos.la.gov" },
  { label: "City Council", href: "https://www.covla.com/covington-city-council/" },
];
