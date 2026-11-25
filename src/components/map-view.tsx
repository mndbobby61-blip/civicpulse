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
  lat: number; lng: number; cat: string; catBn: string | null;
};

const COLOR: Record<string, string> = {
  SUBMITTED: "#ff5d5d", UNDER_REVIEW: "#ffb938", ASSIGNED: "#ffb938",
  IN_PROGRESS: "#ffb938", RESOLVED: "#2de2c4", CLOSED: "#8ea3ae",
};

export default function MapView({ issues, loggedIn }: { issues: MapIssue[]; loggedIn: boolean }) {
  const { t, lang } = useLang();
  const [f, setF] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

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
    return () => { m.remove(); map.current = null; layer.current = null; };
  }, [issues]);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    issues.filter((i) => !f || i.status === f).forEach((i) => {
      const mk = L.circleMarker([i.lat, i.lng], {
        radius: 9, color: "#ffffff", weight: 2, fillColor: COLOR[i.status], fillOpacity: 0.95,
      });
      // টেক্সট সরাসরি DOM-এ বসানো হয়, তাই ইউজারের লেখা থেকে কোড ঢোকার ভয় নেই
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
  }, [issues, f, lang, t, loggedIn]);

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
      <div ref={box} className="cp-bigmap" />
    </>
  );
}