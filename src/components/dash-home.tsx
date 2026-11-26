"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
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
};

export default function DashHome({ name, role, stats, charts, health, progress }: Props) {
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
        <Link href="/leaderboard" className="cp-btn ghost">{t("nav_board")}</Link>
      </div>

      {progress && <div style={{ marginTop: 34 }}><ProgressCard p={progress} /></div>}

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