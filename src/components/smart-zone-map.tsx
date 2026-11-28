"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import { STATUS_COLOR } from "@/lib/ui";
import type { Key } from "@/lib/dict";

export type ZoneIssue = {
  id: string;
  seq: number;
  title: string;
  status: string;
  lat: number;
  lng: number;
  cat: string;
  catBn: string | null;
  area: string | null;
};

const DHAKA_ZONES = [
  { name: "Mirpur Zone", center: [23.8069, 90.3687] as [number, number], radiusM: 2200, color: "#2de2c4" },
  { name: "Uttara Zone", center: [23.8759, 90.3795] as [number, number], radiusM: 2400, color: "#8b7bff" },
  { name: "Gulshan / Banani", center: [23.793, 90.407] as [number, number], radiusM: 1900, color: "#c8f542" },
  { name: "Dhanmondi / Mohammadpur", center: [23.756, 90.367] as [number, number], radiusM: 2100, color: "#ffb938" },
  { name: "Motijheel / Tejgaon", center: [23.748, 90.405] as [number, number], radiusM: 2100, color: "#ff5d5d" },
];

export default function SmartZoneMap({
  issues,
  loggedIn,
}: {
  issues: ZoneIssue[];
  loggedIn: boolean;
}) {
  const { t, lang } = useLang();
  const [catFilter, setCatFilter] = useState("");
  const [showZones, setShowZones] = useState(true);
  const [clusterGrid, setClusterGrid] = useState(0.015);
  const mapRef = useRef<HTMLDivElement>(null);

  const cats = useMemo(() => {
    const map = new Map<string, string | null>();
    issues.forEach((i) => map.set(i.cat, i.catBn));
    return Array.from(map.entries());
  }, [issues]);

  const filtered = useMemo(
    () => issues.filter((i) => !catFilter || i.cat === catFilter),
    [issues, catFilter]
  );

  useEffect(() => {
    if (!mapRef.current) return;
    let map: import("leaflet").Map | null = null;
    let layer: import("leaflet").LayerGroup | null = null;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;
      const m = L.map(mapRef.current).setView([23.78, 90.39], 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(m);
      layer = L.layerGroup().addTo(m);
      map = m;

      const draw = () => {
        if (!layer || !map) return;
        layer.clearLayers();
        const zoom = map.getZoom();
        const cell = zoom >= 15 ? 0 : zoom >= 13 ? clusterGrid * 0.45 : clusterGrid;

        if (showZones) {
          DHAKA_ZONES.forEach((z) => {
            const count = filtered.filter(
              (i) => Math.hypot(i.lat - z.center[0], i.lng - z.center[1]) < 0.022
            ).length;
            L.circle(z.center, {
              radius: z.radiusM,
              color: z.color,
              weight: 2,
              fillColor: z.color,
              fillOpacity: 0.08,
            })
              .bindPopup(`${z.name}: ${count} issue(s)`)
              .addTo(layer!);
          });
        }

        if (cell === 0) {
          filtered.forEach((i) => {
            const mk = L.circleMarker([i.lat, i.lng], {
              radius: 8,
              color: "#fff",
              weight: 2,
              fillColor: STATUS_COLOR[i.status] ?? "#2de2c4",
              fillOpacity: 0.95,
            });
            const el = document.createElement("div");
            const b = document.createElement("b");
            b.textContent = `#CP-${i.seq} ${i.title}`;
            const s = document.createElement("div");
            s.textContent = `${lang === "bn" && i.catBn ? i.catBn : i.cat} · ${t(`st_${i.status}` as Key)}`;
            const a = document.createElement("a");
            a.href = loggedIn ? `/issues/${i.id}` : "/login";
            a.textContent = `${t("mp_open")} →`;
            el.append(b, s, a);
            mk.bindPopup(el).addTo(layer!);
          });
          return;
        }

        const buckets = new Map<string, ZoneIssue[]>();
        filtered.forEach((i) => {
          const key = `${Math.floor(i.lat / cell)}:${Math.floor(i.lng / cell)}`;
          const arr = buckets.get(key) ?? [];
          arr.push(i);
          buckets.set(key, arr);
        });

        buckets.forEach((group) => {
          const avgLat = group.reduce((a, b) => a + b.lat, 0) / group.length;
          const avgLng = group.reduce((a, b) => a + b.lng, 0) / group.length;

          if (group.length === 1) {
            const i = group[0];
            L.circleMarker([i.lat, i.lng], {
              radius: 8,
              color: "#fff",
              weight: 2,
              fillColor: STATUS_COLOR[i.status] ?? "#2de2c4",
              fillOpacity: 0.95,
            })
              .bindPopup(`#CP-${i.seq} · ${i.title}`)
              .addTo(layer!);
            return;
          }

          const icon = L.divIcon({
            className: "",
            html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0fb5a0,#5b6cf0);color:#fff;display:grid;place-items:center;font-weight:800;font-size:13px;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35)">${group.length}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });
          const marker = L.marker([avgLat, avgLng], { icon });
          marker.on("click", () => {
            m.setView([avgLat, avgLng], Math.min(16, m.getZoom() + 2));
          });
          marker.addTo(layer!);
        });
      };

      draw();
      m.on("zoomend", draw);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [filtered, showZones, clusterGrid, lang, t, loggedIn]);

  return (
    <>
      {!loggedIn && <Link href="/" className="cp-back">← CivicPulse</Link>}
      <h1 className="cp-pagetitle">{advT(lang, "nav_zones")}</h1>
      <p className="cp-lead" style={{ marginBottom: 18 }}>
        {lang === "bn"
          ? "ঢাকার এলাকা/জোন বাউন্ডারি এবং স্মার্ট মার্কার ক্লাস্টারিং — জুম করলে ক্লাস্টার ভেঙে আলাদা পিন দেখা যাবে।"
          : "Dhaka zone boundaries and smart marker clustering — zoom in or click a cluster to expand individual pins."}
      </p>

      <div className="cp-filters">
        <button type="button" className={!catFilter ? "on" : ""} onClick={() => setCatFilter("")}>
          {t("iss_all")}
        </button>
        {cats.map(([cat, catBn]) => (
          <button
            key={cat}
            type="button"
            className={catFilter === cat ? "on" : ""}
            onClick={() => setCatFilter(cat)}
          >
            {lang === "bn" && catBn ? catBn : cat}
          </button>
        ))}
      </div>

      <div className="cp-row" style={{ marginBottom: 14, alignItems: "center" }}>
        <button
          type="button"
          className={`cp-btn-sm ${showZones ? "active" : ""}`}
          onClick={() => setShowZones((v) => !v)}
        >
          {showZones ? "Zone Polygons: ON" : "Zone Polygons: OFF"}
        </button>
        <button
          type="button"
          className={`cp-btn-sm ${clusterGrid > 0 ? "active" : ""}`}
          onClick={() => setClusterGrid((v) => (v > 0 ? 0 : 0.015))}
        >
          {clusterGrid > 0 ? "Clustering: ON" : "Clustering: OFF"}
        </button>
      </div>

      <div ref={mapRef} className="cp-bigmap" />
    </>
  );
}
