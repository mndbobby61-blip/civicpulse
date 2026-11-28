"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import { optimizeFieldRoute, type RouteStop } from "@/lib/route-planner";
import { PRIO_COLOR, STATUS_COLOR } from "@/lib/ui";
import type { Key } from "@/lib/dict";

const DHAKA_CENTER: [number, number] = [23.7808, 90.4067];

export default function StaffRouteView({ stops }: { stops: RouteStop[] }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const [origin, setOrigin] = useState<[number, number]>(DHAKA_CENTER);
  const mapBox = useRef<HTMLDivElement>(null);

  const { ordered, totalKm } = useMemo(
    () => optimizeFieldRoute(stops, origin[0], origin[1]),
    [stops, origin]
  );

  useEffect(() => {
    if (!mapBox.current || ordered.length === 0) return;
    let mapInstance: import("leaflet").Map | null = null;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapBox.current) return;
      const m = L.map(mapBox.current).setView(origin, 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(m);

      const pts: [number, number][] = [origin, ...ordered.map((s) => [s.lat, s.lng] as [number, number])];
      L.polyline(pts, { color: "#0fb5a0", weight: 4, dashArray: "8 6" }).addTo(m);

      L.circleMarker(origin, {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: "#5b6cf0",
        fillOpacity: 1,
      })
        .bindPopup("Start")
        .addTo(m);

      ordered.forEach((s) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:26px;height:26px;border-radius:50%;background:#0a8f3c;color:#fff;display:grid;place-items:center;font-weight:800;font-size:12px;border:2px solid #fff">${s.step}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker([s.lat, s.lng], { icon })
          .bindPopup(`#${s.step}: CP-${s.seq}`)
          .addTo(m);
      });

      m.fitBounds(L.latLngBounds(pts), { padding: [32, 32] });
      mapInstance = m;
    });

    return () => {
      cancelled = true;
      mapInstance?.remove();
    };
  }, [ordered, origin]);

  function useGps() {
    navigator.geolocation?.getCurrentPosition((p) => {
      setOrigin([p.coords.latitude, p.coords.longitude]);
    });
  }

  return (
    <>
      <h1 className="cp-pagetitle">{advT(lang, "rt_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 20 }}>{advT(lang, "rt_lead")}</p>

      <div className="cp-row" style={{ alignItems: "center", marginBottom: 20 }}>
        <button type="button" className="cp-btn ghost" onClick={useGps}>
          {advT(lang, "rt_gps")}
        </button>
        <span className="cp-chip" style={{ color: "var(--g2)" }}>
          {ordered.length.toLocaleString(loc)} {advT(lang, "rt_stops")} · {advT(lang, "rt_total")}: {totalKm.toLocaleString(loc)} km
        </span>
      </div>

      {ordered.length === 0 ? (
        <p className="cp-lead">{advT(lang, "rt_empty")}</p>
      ) : (
        <>
          <div ref={mapBox} className="cp-bigmap" style={{ height: 380, marginBottom: 24 }} />
          <div className="cp-irows">
            {ordered.map((s) => (
              <div
                key={s.id}
                className="cp-card cp-irow"
                style={{ "--pc": STATUS_COLOR[s.status] } as React.CSSProperties}
              >
                <span className="cp-step-badge">{s.step}</span>
                <div className="tx">
                  <Link href={`/issues/${s.id}`}>
                    <b>#CP-{s.seq} · {s.title}</b>
                  </Link>
                  <small>
                    {lang === "bn" && s.catBn ? s.catBn : s.cat} · {s.address} · +{s.distanceKm} km ({s.cumulativeKm} km)
                  </small>
                </div>
                <span className="dotp" style={{ background: PRIO_COLOR[s.priority] }} title={t(`pr_${s.priority}` as Key)} />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="cp-btn-sm active"
                >
                  {advT(lang, "rt_nav")} →
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
