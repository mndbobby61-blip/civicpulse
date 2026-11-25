"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import Analytics, { type ChartData } from "./analytics";
import { logoutAction } from "@/lib/auth-actions";
import type { Key } from "@/lib/dict";

type Props = {
  name: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "CITIZEN";
  stats: { total: number; open: number; resolved: number };
  charts?: ChartData;
};

export default function DashHome({ name, role, stats, charts }: Props) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const cards: [Key, number][] = [
    ["dash_total", stats.total],
    ["dash_open", stats.open],
    ["dash_resolved", stats.resolved],
  ];
  return (
    <main className="cp-wrap cp-dash">
      <div className="cp-dtop">
        <Link href="/" className="cp-logo">CivicPulse</Link>
        <div className="cp-row">
          <LangToggle />
          <form action={logoutAction}>
            <button className="cp-btn ghost" style={{ padding: "10px 20px" }}>{t("logout")}</button>
          </form>
        </div>
      </div>
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
      </div>

      {charts && <Analytics d={charts} />}
    </main>
  );
}