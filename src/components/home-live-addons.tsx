"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import City3DTwin, { type Area3DNode } from "./city-3d-twin";

type Highlights = {
  banner: { bn: string; en: string };
  areas3d: Area3DNode[];
  beforeAfter: { id: string; seq: number; title: string; area: string | null; before: string; after: string }[];
};

export function HomeNoticeBanner() {
  const { lang } = useLang();
  const [banner, setBanner] = useState<{ bn: string; en: string } | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/home-highlights")
      .then((r) => r.json())
      .then((d: Highlights) => {
        if (live && d.banner) setBanner(d.banner);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const text = banner ? (lang === "bn" ? banner.bn || banner.en : banner.en || banner.bn) : "";
  if (!text) return null;

  return (
    <div className="cp-wrap" style={{ marginTop: 18 }}>
      <div className="cp-home-banner" role="status">
        <span className="cp-chip" style={{ color: "var(--g2)" }}>{advT(lang, "hm_notice")}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}

export function HomeAdvancedSection() {
  const { lang } = useLang();
  const [data, setData] = useState<Highlights | null>(null);
  const [pct, setPct] = useState(50);

  useEffect(() => {
    let live = true;
    fetch("/api/home-highlights")
      .then((r) => r.json())
      .then((d: Highlights) => {
        if (live) setData(d);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const ba = data?.beforeAfter[0] ?? null;

  return (
    <section className="cp-sec" id="city3d">
      <div className="cp-wrap">
        <div className="cp-eyebrow">{advT(lang, "hm_3d_eyebrow")}</div>
        <h2 className="cp-h2">{advT(lang, "hm_3d_title")}</h2>
        <p className="cp-lead" style={{ marginBottom: 24 }}>{advT(lang, "hm_3d_lead")}</p>

        <City3DTwin areas={data?.areas3d ?? []} height={420} />

        <div className="cp-row" style={{ marginTop: 20 }}>
          <Link href="/city-3d" className="cp-btn">{advT(lang, "hm_open_3d")}</Link>
          <Link href="/map/zones" className="cp-btn ghost">{advT(lang, "hm_open_zones")}</Link>
          <Link href="/areas" className="cp-btn ghost">{advT(lang, "hm_open_areas")}</Link>
        </div>

        {ba && (
          <div className="cp-adv-panel" style={{ marginTop: 32 }}>
            <h3>{advT(lang, "hm_live_ba_title")} — #CP-{ba.seq}: {ba.title}</h3>
            <p className="cp-mute" style={{ marginTop: 0 }}>{advT(lang, "hm_live_ba_lead")}</p>
            <div className="cp-ba-live">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ba.before} alt="Before" />
              <div className="after-layer" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ba.after} alt="After" />
              </div>
              <div className="divider" style={{ left: `${pct}%` }} />
              <input
                type="range"
                min={0}
                max={100}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                aria-label={advT(lang, "hm_live_ba_title")}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href={`/issues/${ba.id}`} className="cp-btn-sm active">
                #CP-{ba.seq} →
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
