"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import AppShell from "./app-shell";
import Analytics, { type ChartData } from "./analytics";
import ProgressCard from "./progress-card";
import type { Health } from "@/lib/health";
import type { Progress } from "@/lib/gamify";
import type { Key } from "@/lib/dict";

type V = React.CSSProperties;
type Props = {
  name: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "CITIZEN";
  stats: { total: number; open: number; resolved: number };
  charts?: ChartData;
  health?: Health;
  progress?: Progress;
  citizenExtra?: { myTotal: number; myResolved: number; avgRating: number | null; points: number };
};

export default function DashHome({ name, role, stats, charts, health, progress, citizenExtra }: Props) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const cards: [Key, number][] = [
    ["dash_total", stats.total],
    ["dash_open", stats.open],
    ["dash_resolved", stats.resolved],
  ];
  const parts: [Key, number][] = health
    ? [["hl_res", health.res], ["hl_sla", health.sla], ["hl_sat", health.sat], ["hl_late", health.late]]
    : [];

  return (
    <AppShell role={role}>
      <h1>{t("dash_welcome")}, <span className="cp-grad">{name}</span></h1>
      <span className="cp-chip cp-role" style={{ color: "var(--g2)" }}>{t(`role_${role.toLowerCase()}` as Key)}</span>

      <div className="cp-stats">
        {cards.map(([k, v]) => (
          <div className="cp-stat" key={k}>
            <b>{v.toLocaleString(loc)}</b>
            <span>{t(k)}</span>
          </div>
        ))}
      </div>

      <div className="cp-row" style={{ marginTop: 30 }}>
        <Link href="/issues" className="cp-btn">{t("app_issues")}</Link>
        {role === "CITIZEN" && <Link href="/issues/new" className="cp-btn ghost">{t("app_new")}</Link>}
        {role === "STAFF" && <Link href="/staff/route" className="cp-btn ghost">{advT(lang, "nav_route")}</Link>}
        {(role === "ADMIN" || role === "MANAGER") && <Link href="/admin/reports" className="cp-btn ghost">{advT(lang, "nav_reports")}</Link>}
        <Link href="/areas" className="cp-btn ghost">{advT(lang, "nav_areas")}</Link>
        <Link href="/city-3d" className="cp-btn ghost">{advT(lang, "nav_city3d")}</Link>
        <Link href="/map/zones" className="cp-btn ghost">{advT(lang, "nav_zones")}</Link>
        <Link href="/leaderboard" className="cp-btn ghost">{t("nav_board")}</Link>
      </div>

      {progress && <div style={{ marginTop: 34 }}><ProgressCard p={progress} /></div>}

      {/* Citizen animated stats cards */}
      {role === "CITIZEN" && citizenExtra && (
        <div className="cp-ctz-stats" style={{ marginTop: 28 }}>
          <div className="cp-ctz-card" style={{ "--accent": "#2de2c4" } as React.CSSProperties}>
            <div className="cp-ctz-icon">📋</div>
            <div className="cp-ctz-val">{citizenExtra.myTotal.toLocaleString(loc)}</div>
            <div className="cp-ctz-lbl">{advT(lang, "ctz_my_reports")}</div>
          </div>
          <div className="cp-ctz-card" style={{ "--accent": "#c8f542" } as React.CSSProperties}>
            <div className="cp-ctz-icon">✅</div>
            <div className="cp-ctz-val">
              {citizenExtra.myTotal > 0
                ? `${Math.round((citizenExtra.myResolved / citizenExtra.myTotal) * 100).toLocaleString(loc)}%`
                : "—"}
            </div>
            <div className="cp-ctz-lbl">{advT(lang, "ctz_resolved_pct")}</div>
          </div>
          <div className="cp-ctz-card" style={{ "--accent": "#ffb938" } as React.CSSProperties}>
            <div className="cp-ctz-icon">⭐</div>
            <div className="cp-ctz-val">
              {citizenExtra.avgRating !== null ? citizenExtra.avgRating.toFixed(1) : "—"}
            </div>
            <div className="cp-ctz-lbl">{advT(lang, "ctz_avg_rating")}</div>
          </div>
          <div className="cp-ctz-card" style={{ "--accent": "#8b7bff" } as React.CSSProperties}>
            <div className="cp-ctz-icon">🏅</div>
            <div className="cp-ctz-val">{citizenExtra.points.toLocaleString(loc)}</div>
            <div className="cp-ctz-lbl">{advT(lang, "ctz_total_points")}</div>
          </div>
        </div>
      )}

      {health && (
        <div className="cp-health">
          <div className="cp-ring big" style={{ "--pct": `${health.score}%` } as V}><b>{health.score.toLocaleString(loc)}</b></div>
          <div>
            <h3>{t("hl_title")} <span className="cp-chip" style={{ color: "var(--g2)", marginLeft: 8 }}>
              {health.score >= 80 ? t("hl_good") : health.score >= 60 ? t("hl_ok") : t("hl_low")}
            </span></h3>
            <p className="cp-mute">{t("hl_lead")}</p>
            <div className="cp-hparts">
              {parts.map(([k, v]) => (
                <div className="cp-mini" key={k}>
                  <span>{t(k)}<b>{v.toLocaleString(loc)}%</b></span>
                  <i style={{ "--w": `${v}%` } as V} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {charts && <Analytics d={charts} />}
    </AppShell>
  );
}