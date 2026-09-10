import type { Voter } from "./types";
import { householdKey } from "./format";
import { assetUrl } from "./asset";

export type StreetGeo = Record<string, { lat: number; lng: number; matched?: string; approx?: boolean }>;

export const COV_CENTER = { lat: 30.4758, lng: -90.105 };
/** Tight box around Covington city — drops Census matches that landed in Slidell, Hammond, out of state. */
export const COV_BOUNDS = { south: 30.4, north: 30.53, west: -90.17, east: -90.07 };
const GEO_VER = "1";

let cache: StreetGeo | null = null;

export async function loadStreetGeo(): Promise<StreetGeo> {
  if (cache) return cache;
  const r = await fetch(`${assetUrl("data/street-geo.json")}?v=${GEO_VER}`);
  if (!r.ok) return {};
  cache = (await r.json()) as StreetGeo;
  return cache;
}

export function inCityBounds(lat: number, lng: number) {
  return lat >= COV_BOUNDS.south && lat <= COV_BOUNDS.north && lng >= COV_BOUNDS.west && lng <= COV_BOUNDS.east;
}

export function streetKey(v: Pick<Voter, "street" | "zip">) {
  return `${(v.street || "").trim()}|${(v.zip || "70433").slice(0, 5)}`;
}

export function voterCoords(v: Voter, geo: StreetGeo): { lat: number; lng: number } | null {
  if (!v.street || v.street === "PO BOX") return null;
  if (v.region === "PO Box / mail" || v.region === "Out of town") return null;
  const g = geo[streetKey(v)];
  if (!g) return null;
  if (!inCityBounds(g.lat, g.lng)) return null;
  const n = parseInt(v.house, 10);
  const house = Number.isFinite(n) ? n : 0;
  const along = ((house % 80) - 40) * 0.000035;
  const side = (house % 2 === 0 ? 1 : -1) * 0.000028;
  return { lat: g.lat + along, lng: g.lng + side };
}

export function householdCoords(house: Voter[], geo: StreetGeo) {
  const head = house[0];
  if (!head) return null;
  return voterCoords(head, geo);
}

export { householdKey };
