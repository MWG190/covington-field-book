export type Party = "REP" | "DEM" | "NOPTY" | "LBT" | "GRN" | "OTHER" | string;
export type DistrictId = "A" | "B" | "C" | "D" | "E";
export type MarkStatus =
  | "uncontacted"
  | "contacted"
  | "not-home"
  | "supporter"
  | "lean"
  | "opposed"
  | "refused";

export type InmanVote = "" | "yes" | "no";
export type ListTab = "all" | "unmarked" | "inman" | "not-inman" | "nothome" | "yard" | "gotv";
export type TurnoutFilter = "any" | "likely" | "dropoff" | "unlikely";

export type Voter = {
  id: string;
  fn: string;
  mn: string;
  ln: string;
  addr: string;
  addr2: string;
  city: string;
  st: string;
  zip: string;
  zip4: string;
  pct: string;
  dist: DistrictId | string;
  party: Party;
  age: number | null;
  sex: string;
  race: string;
  phone: string;
  lv: string;
  rd: string;
  status: string;
  walk: number | null;
  house: string;
  street: string;
  unit: string;
  pj: string;
  sb: string;
  hd: string;
  sen: string;
  cd: string;
  bese: string;
  ac: string;
  dc: string;
  jp: string;
  psc: string;
  sc: string;
  tw: string;
  rscc: string;
  dscc: string;
  taxc: string;
  rec: string;
  fir: string;
  nb: string[];
  region: string;
};

export type Mark = {
  status: MarkStatus;
  note: string;
  updated: string;
  inman: InmanVote;
  yard: boolean;
};

export type SliceStats = {
  n: number;
  parties: Record<string, number>;
  precincts: Record<string, number>;
  avgAge: number | null;
  phones: number;
  voted2024: number;
  ageBuckets: Record<string, number>;
  sex: Record<string, number>;
  race?: Record<string, number>;
  nb: Record<string, number>;
  regions?: Record<string, number>;
  streets: number;
  households: number;
};

export type StatsFile = {
  total: number;
  generated: string;
  source: string;
  city: SliceStats;
  districts: Record<string, SliceStats>;
  precincts: Record<string, SliceStats>;
  neighborhoods: Record<string, SliceStats>;
  regions?: Record<string, SliceStats>;
};
