import type { Voter } from "./types";
import { csvEscape, fullName, householdKey, titleCaseStreet } from "./format";
import { voterCoords, type StreetGeo } from "./geo";
import type { TurfPacket } from "./turf-cut";
import { turnoutScore, turnoutTier } from "./turnout";
import type { Mark } from "./types";

function download(filename: string, text: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** TurfBuilder example-data/people.csv columns. */
export function exportTurfBuilderPeople(rows: Voter[]) {
  const lines = ["first_name,last_name,middle_name,suffix,email,phone,dob,gender"];
  for (const v of rows) {
    lines.push(
      [v.fn, v.ln, v.mn, "", "", v.phone, "", v.sex]
        .map((x) => csvEscape(String(x ?? "")))
        .join(","),
    );
  }
  download(`turfbuilder-people-${rows.length}.csv`, lines.join("\n"));
}

/** TurfBuilder example-data/locations.csv columns. One row per household. */
export function exportTurfBuilderLocations(rows: Voter[], geo: StreetGeo) {
  const seen = new Set<string>();
  const lines = [
    "name,address_line_1,address_line_2,city,state_or_region,postal_code,country_code,latitude,longitude",
  ];
  for (const v of rows) {
    const k = householdKey(v);
    if (seen.has(k)) continue;
    seen.add(k);
    const c = voterCoords(v, geo);
    const name = `${v.house} ${titleCaseStreet(v.street)}`.trim();
    lines.push(
      [
        name,
        v.addr,
        v.addr2 || v.unit,
        v.city || "COVINGTON",
        v.st || "LA",
        v.zip,
        "US",
        c ? c.lat.toFixed(6) : "",
        c ? c.lng.toFixed(6) : "",
      ]
        .map((x) => csvEscape(String(x ?? "")))
        .join(","),
    );
  }
  download(`turfbuilder-locations-${seen.size}.csv`, lines.join("\n"));
}

export function exportTurfPackets(
  rows: Voter[],
  packets: TurfPacket[],
  marks: Record<string, Mark>,
  geo: StreetGeo,
) {
  const byId = new Map(rows.map((v) => [v.id, v]));
  const lines = [
    "turf_id,turf_name,region,first_name,last_name,middle_name,address,unit,city,zip,phone,party,age,precinct,district,support,yard_sign,turnout,latitude,longitude,reg_num",
  ];
  for (const p of packets) {
    for (const id of p.ids) {
      const v = byId.get(id);
      if (!v) continue;
      const mk = marks[v.id];
      const c = voterCoords(v, geo);
      const support =
        mk?.inman === "yes" ? "Voting Inman" : mk?.inman === "no" ? "Not Voting Inman" : "";
      lines.push(
        [
          p.id,
          p.name,
          p.region,
          v.fn,
          v.ln,
          v.mn,
          v.addr,
          v.unit,
          v.city,
          v.zip,
          v.phone,
          v.party,
          String(v.age ?? ""),
          v.pct,
          v.dist,
          support,
          mk?.yard ? "Yes" : "",
          `${turnoutScore(v)} ${turnoutTier(v)}`,
          c ? c.lat.toFixed(6) : "",
          c ? c.lng.toFixed(6) : "",
          v.id,
        ]
          .map((x) => csvEscape(String(x)))
          .join(","),
      );
    }
  }
  download(`covington-turfs-${packets.length}.csv`, lines.join("\n"));
}

export function exportTurfGeoJson(rows: Voter[], packets: TurfPacket[], geo: StreetGeo) {
  const byId = new Map(rows.map((v) => [v.id, v]));
  const features: object[] = [];
  packets.forEach((p, i) => {
    features.push({
      type: "Feature",
      properties: {
        id: p.id,
        name: p.name,
        region: p.region,
        doors: p.doors,
        voters: p.voters,
        kind: "turf-centroid",
      },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    });
    for (const id of p.ids) {
      const v = byId.get(id);
      if (!v) continue;
      const c = voterCoords(v, geo);
      if (!c) continue;
      features.push({
        type: "Feature",
        properties: {
          turf_id: p.id,
          name: fullName(v),
          address: v.addr,
          kind: "door",
        },
        geometry: { type: "Point", coordinates: [c.lng, c.lat] },
      });
    }
    void i;
  });
  download(
    `covington-turfs.geojson`,
    JSON.stringify({ type: "FeatureCollection", features }),
    "application/geo+json",
  );
}
