import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { householdKey, titleCaseStreet } from "@/lib/format";
import { COV_CENTER, voterCoords, type StreetGeo } from "@/lib/geo";
import { turfColor, type TurfPacket } from "@/lib/turf-cut";
import type { Voter } from "@/lib/types";

type LeafletNS = typeof import("leaflet");

type Props = {
  packets: TurfPacket[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  rows: Voter[];
  geo: StreetGeo;
};

export function TurfMap({ packets, selectedId, onSelect, rows, geo }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ map: LeafletMap; layers: LayerGroup; L: LeafletNS } | null>(null);
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const prevSel = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | undefined;
    void (async () => {
      if (typeof window === "undefined") return;
      const mod = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const L = (mod.default ?? mod) as LeafletNS;
      if (cancelled || !host.current) return;
      const map = L.map(host.current, {
        scrollWheelZoom: true,
        zoomControl: true,
      }).setView([COV_CENTER.lat, COV_CENTER.lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      const layers = L.layerGroup().addTo(map);
      api.current = { map, layers, L };
      setReady(true);
      requestAnimationFrame(() => map.invalidateSize());
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(host.current);
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      api.current?.map.remove();
      api.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const handle = api.current;
    if (!ready || !handle) return;
    const { map, layers, L } = handle;
    layers.clearLayers();

    const byId = new Map(rows.map((v) => [v.id, v]));
    packets.forEach((p, i) => {
      const color = turfColor(i);
      const on = p.id === selectedId;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: on ? 14 : 9,
        color,
        weight: on ? 3 : 2,
        fillColor: color,
        fillOpacity: on ? 0.95 : 0.72,
      });
      marker.bindTooltip(`${p.id} · ${p.doors} doors`, { direction: "top", offset: [0, -8] });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current(p.id);
      });
      marker.addTo(layers);
    });

    if (selectedId) {
      const p = packets.find((x) => x.id === selectedId);
      if (p) {
        const seen = new Set<string>();
        const color = turfColor(packets.indexOf(p));
        for (const id of p.ids) {
          const v = byId.get(id);
          if (!v) continue;
          const hk = householdKey(v);
          if (seen.has(hk)) continue;
          seen.add(hk);
          const c = voterCoords(v, geo);
          if (!c) continue;
          const door = L.circleMarker([c.lat, c.lng], {
            radius: 5,
            color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.9,
          });
          door.bindTooltip(`${v.house} ${titleCaseStreet(v.street)}`, { direction: "top" });
          door.on("click", (e) => L.DomEvent.stopPropagation(e));
          door.addTo(layers);
        }
      }
    }

    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (selectedId && selectedId !== prevSel.current) {
      const p = packets.find((x) => x.id === selectedId);
      if (p) {
        if (reduce) map.setView([p.lat, p.lng], 16);
        else map.flyTo([p.lat, p.lng], 16, { duration: 0.45 });
      }
    } else if (!selectedId && packets.length) {
      const b = L.latLngBounds(packets.map((p) => [p.lat, p.lng] as [number, number]));
      if (b.isValid()) map.fitBounds(b.pad(0.18), { animate: !reduce });
    } else if (!packets.length) {
      map.setView([COV_CENTER.lat, COV_CENTER.lng], 13);
    }
    prevSel.current = selectedId;
  }, [ready, packets, selectedId, rows, geo]);

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line">
      <div
        ref={host}
        className="turf-map h-[min(52vh,520px)] min-h-72 w-full bg-paper-2"
        role="img"
        aria-label="Covington turf map"
      />
      {!ready && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
          Loading map…
        </p>
      )}
    </div>
  );
}
