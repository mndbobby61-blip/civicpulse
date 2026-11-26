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

  // স্ট্যাটাস ফিল্টার ও "শেষ N দিন" স্লাইডার
  useEffect(() => {
    const cutoff = Date.now() - days * 86_400_000;
    setShown(issues.filter((i) => (!f || i.status === f) && new Date(i.at).getTime() >= cutoff));
  }, [issues, f, days]);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    shown.forEach((i) => {
      // হিটম্যাপ: আধা-স্বচ্ছ বড় বৃত্ত একটার ওপর আরেকটা পড়ে ঘন হয়, যেখানে সমস্যা বেশি সেখানে গাঢ় লাল
      if (mode === "heat") {
        g.addLayer(L.circle([i.lat, i.lng], { radius: 450, stroke: false, fillColor: "#ff4d2e", fillOpacity: 0.15, interactive: false }));
        return;
      }
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
  }, [shown, mode, lang, t, loggedIn]);

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
        <small className="cp-mute">{shown.length.toLocaleString(loc)} {t("mp_shown")}</small>
      </div>
      <div ref={box} className="cp-bigmap" />
    </>
  );
}