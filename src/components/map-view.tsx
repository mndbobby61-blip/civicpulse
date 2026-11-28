"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "./lang-provider";
import { STATUSES } from "@/lib/ui";
import type { Key } from "@/lib/dict";

export type MapIssue = {
  id: string; seq: number; title: string; status: string;
  lat: number; lng: number; cat: string; catBn: string | null; at: string;
};

const COLOR: Record<string, string> = {
  SUBMITTED: "#ff5d5d", UNDER_REVIEW: "#ffb938", ASSIGNED: "#ffb938",
  IN_PROGRESS: "#ffb938", RESOLVED: "#2de2c4", CLOSED: "#8ea3ae",
};

/** Native Leaflet cluster group — groups nearby markers at low zoom levels */
function buildClusterLayer(issues: MapIssue[], zoom: number, t: (k: Key) => string, lang: string, loggedIn: boolean): L.LayerGroup {
  const g = L.layerGroup();
  const CLUSTER_RADIUS_PX = 60; // pixel radius at given zoom for grouping

  // Build clusters using a simple grid approach
  const scale = Math.pow(2, zoom);
  const gridCells = new Map<string, MapIssue[]>();

  issues.forEach((i) => {
    // Convert lat/lng to tile coordinates at current zoom
    const tx = Math.floor(((i.lng + 180) / 360) * scale / (256 / CLUSTER_RADIUS_PX));
    const latRad = (i.lat * Math.PI) / 180;
    const ty = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale / (256 / CLUSTER_RADIUS_PX));
    const key = `${tx}:${ty}`;
    if (!gridCells.has(key)) gridCells.set(key, []);
    gridCells.get(key)!.push(i);
  });

  gridCells.forEach((group) => {
    if (group.length === 1 || zoom >= 14) {
      // Individual markers
      group.forEach((i) => {
        const mk = L.circleMarker([i.lat, i.lng], {
          radius: 9, color: "#ffffff", weight: 2, fillColor: COLOR[i.status], fillOpacity: 0.95,
        });
        const el = document.createElement("div");
        const b = document.createElement("b");
        b.textContent = i.title;
        const s = document.createElement("div");
        s.textContent = `${lang === "bn" && i.catBn ? i.catBn : i.cat} · ${t(`st_${i.status}` as Key)}`;
        const a = document.createElement("a");
        a.href = loggedIn ? `/issues/${i.id}` : "/login";
        a.textContent = `${t("mp_open")} →`;
        a.style.color = "#0a8f3c";
        a.style.fontWeight = "600";
        el.append(b, s, a);
        mk.bindPopup(el);
        g.addLayer(mk);
      });
    } else {
      // Cluster marker
      const avgLat = group.reduce((s, i) => s + i.lat, 0) / group.length;
      const avgLng = group.reduce((s, i) => s + i.lng, 0) / group.length;

      // Dominant status color
      const statusCount: Record<string, number> = {};
      group.forEach((i) => { statusCount[i.status] = (statusCount[i.status] ?? 0) + 1; });
      const dominant = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0][0];
      const clrFill = COLOR[dominant] ?? "#8b7bff";

      const size = group.length;
      const radius = Math.min(10 + Math.sqrt(size) * 4, 32);

      const mk = L.circleMarker([avgLat, avgLng], {
        radius,
        color: "#ffffff",
        weight: 2.5,
        fillColor: clrFill,
        fillOpacity: 0.88,
      });

      // Cluster popup
      const el = document.createElement("div");
      el.style.textAlign = "center";
      const h = document.createElement("b");
      h.textContent = `${size} ${lang === "bn" ? "টি রিপোর্ট" : "reports"}`;
      h.style.fontSize = "15px";
      const sub = document.createElement("div");
      sub.textContent = lang === "bn" ? "জুম করুন আলাদা দেখতে" : "Zoom in to see individually";
      sub.style.color = "var(--cp-mute, #8ea3ae)";
      sub.style.marginTop = "4px";
      el.append(h, sub);
      mk.bindPopup(el);

      // Count label (via tooltip)
      mk.bindTooltip(String(size), {
        permanent: true,
        direction: "center",
        className: "cp-cluster-label",
        offset: [0, 0],
      });

      g.addLayer(mk);
    }
  });

  return g;
}

export default function MapView({ issues, loggedIn }: { issues: MapIssue[]; loggedIn: boolean }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const [f, setF] = useState("");
  const [mode, setMode] = useState<"pins" | "heat">("pins");
  const [days, setDays] = useState(90);
  const [shown, setShown] = useState<MapIssue[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current).setView([23.78, 90.4], 11);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap", maxZoom: 19,
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    if (issues.length) {
      m.fitBounds(L.latLngBounds(issues.map((i) => [i.lat, i.lng] as [number, number])), { padding: [30, 30] });
    }
    m.on("zoomend", () => setZoom(m.getZoom()));
    return () => { m.remove(); map.current = null; layer.current = null; };
  }, [issues]);

  // স্ট্যাটাস ফিল্টার ও "শেষ N দিন" স্লাইডার
  useEffect(() => {
    const cutoff = Date.now() - days * 86_400_000;
    setShown(issues.filter((i) => (!f || i.status === f) && new Date(i.at).getTime() >= cutoff));
  }, [issues, f, days]);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    if (mode === "heat") {
      // হিটম্যাপ: আধা-স্বচ্ছ বড় বৃত্ত একটার ওপর আরেকটা পড়ে ঘন হয়
      shown.forEach((i) => {
        g.addLayer(L.circle([i.lat, i.lng], { radius: 450, stroke: false, fillColor: "#ff4d2e", fillOpacity: 0.15, interactive: false }));
      });
      return;
    }
    // Clustering mode
    const clusterGroup = buildClusterLayer(shown, zoom, t, lang, loggedIn);
    clusterGroup.getLayers().forEach((l) => g.addLayer(l));
  }, [shown, mode, zoom, lang, t, loggedIn]);

  return (
    <>
      {!loggedIn && <Link href="/" className="cp-back">← CivicPulse</Link>}
      <h1 className="cp-pagetitle">{t("mp_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 20 }}>{t("mp_lead")}</p>
      <div className="cp-filters">
        <button type="button" className={!f ? "on" : ""} onClick={() => setF("")}>{t("iss_all")}</button>
        {STATUSES.map((s) => (
          <button type="button" key={s} className={f === s ? "on" : ""} onClick={() => setF(s)}>
            {t(`st_${s}` as Key)}
          </button>
        ))}
      </div>
      <div className="cp-mctl">
        <div className="cp-filters" style={{ margin: 0 }}>
          <button type="button" className={mode === "pins" ? "on" : ""} onClick={() => setMode("pins")}>{t("mp_pins")}</button>
          <button type="button" className={mode === "heat" ? "on" : ""} onClick={() => setMode("heat")}>{t("mp_heat")}</button>
        </div>
        <label>
          <span>{t("mp_last")} <b>{days.toLocaleString(loc)}</b> {t("mp_d")}</span>
          <input type="range" min={7} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label={t("mp_d")} />
        </label>
        <small className="cp-mute">{shown.length.toLocaleString(loc)} {t("mp_shown")}{zoom < 14 && shown.length > 20 ? (lang === "bn" ? " (ক্লাস্টার মোড)" : " (clustered)") : ""}</small>
      </div>
      <div ref={box} className="cp-bigmap" />
    </>
  );
}