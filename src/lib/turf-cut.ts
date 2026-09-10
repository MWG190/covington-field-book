import type { Voter } from "./types";
import { householdKey, titleCaseStreet } from "./format";
import { COV_CENTER, voterCoords, type StreetGeo } from "./geo";

export type TurfPacket = {
  id: string;
  name: string;
  region: string;
  streets: string[];
  doors: number;
  voters: number;
  ids: string[];
  lat: number;
  lng: number;
};

export const PACKET_SIZES = [25, 40, 60] as const;

const COLORS = ["#3e5c56", "#6f8f4e", "#4d7c9a", "#b07a32", "#8a3d38", "#2f5d42", "#8a5a24", "#b06b7a"];

export function turfColor(i: number) {
  return COLORS[i % COLORS.length];
}

function walkable(v: Voter) {
  if (!v.street || v.street === "PO BOX") return false;
  if (v.region === "PO Box / mail" || v.region === "Out of town") return false;
  return true;
}

/** Pack filtered voters into walk packets of ~doorsPer households, street-contiguous within a region. */
export function cutTurfs(rows: Voter[], geo: StreetGeo, doorsPer = 40): TurfPacket[] {
  const byRegion = new Map<string, Voter[]>();
  for (const v of rows) {
    if (!walkable(v)) continue;
    const k = v.region || "Other";
    const list = byRegion.get(k) ?? [];
    list.push(v);
    byRegion.set(k, list);
  }

  const packets: TurfPacket[] = [];
  let n = 1;
  for (const [region, people] of [...byRegion.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const streets = new Map<string, Voter[]>();
    for (const v of people) {
      const list = streets.get(v.street) ?? [];
      list.push(v);
      streets.set(v.street, list);
    }
    const ordered = [...streets.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    let acc: Voter[] = [];
    let accStreets: string[] = [];
    const flush = () => {
      if (!acc.length) return;
      const doors = new Set(acc.map((v) => householdKey(v))).size;
      const pts = acc.map((v) => voterCoords(v, geo)).filter(Boolean) as { lat: number; lng: number }[];
      const lat = pts.length ? pts.reduce((s, p) => s + p.lat, 0) / pts.length : COV_CENTER.lat;
      const lng = pts.length ? pts.reduce((s, p) => s + p.lng, 0) / pts.length : COV_CENTER.lng;
      const streetLabel = accStreets.length === 1 ? titleCaseStreet(accStreets[0]) : `${accStreets.length} streets`;
      packets.push({
        id: `T-${String(n).padStart(3, "0")}`,
        name: `${region} · ${streetLabel}`,
        region,
        streets: [...accStreets],
        doors,
        voters: acc.length,
        ids: acc.map((v) => v.id),
        lat,
        lng,
      });
      n += 1;
      acc = [];
      accStreets = [];
    };

    for (const [street, list] of ordered) {
      const doorsHere = new Set(list.map((v) => householdKey(v))).size;
      const accDoors = new Set(acc.map((v) => householdKey(v))).size;
      if (acc.length && accDoors + doorsHere > doorsPer && accDoors >= Math.max(8, Math.floor(doorsPer * 0.45))) {
        flush();
      }
      acc.push(...list);
      if (!accStreets.includes(street)) accStreets.push(street);
      if (new Set(acc.map((v) => householdKey(v))).size >= doorsPer) flush();
    }
    flush();
  }
  return packets;
}

export function packetOf(id: string, packets: TurfPacket[]) {
  return packets.find((p) => p.ids.includes(id));
}
