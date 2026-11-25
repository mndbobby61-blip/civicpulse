"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import { logoutAction } from "@/lib/auth-actions";

export default function AppShell({ role, home, children }: { role: string; home: string; children: React.ReactNode }) {
  const { t } = useLang();
  return (
    <div className="cp-wrap cp-dash">
      <div className="cp-dtop">
        <div className="cp-row" style={{ alignItems: "center", gap: 22, flexWrap: "nowrap" }}>
          <Link href="/" className="cp-logo">CivicPulse</Link>
          <nav className="cp-appnav">
            <Link href={home}>{t("app_home")}</Link>
            <Link href="/issues">{t("app_issues")}</Link>
            {role === "CITIZEN" && <Link href="/issues/new">{t("app_new")}</Link>}
          </nav>
        </div>
        <div className="cp-row" style={{ alignItems: "center", flexWrap: "nowrap" }}>
          <LangToggle />
          <form action={logoutAction}>
            <button className="cp-btn ghost" style={{ padding: "10px 20px" }}>{t("logout")}</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}