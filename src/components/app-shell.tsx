"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import { logoutAction } from "@/lib/auth-actions";

const HOME: Record<string, string> = {
  ADMIN: "/admin", MANAGER: "/manager", STAFF: "/staff", CITIZEN: "/citizen",
};

export default function AppShell({ role, home, children }: { role: string; home?: string; children: React.ReactNode }) {
  const { t } = useLang();
  return (
    <div className="cp-wrap cp-dash">
      <div className="cp-dtop">
        <div className="cp-row" style={{ alignItems: "center", gap: 18 }}>
          <Link href="/" className="cp-logo">CivicPulse</Link>
          <nav className="cp-appnav">
            <Link href={home ?? HOME[role] ?? "/"}>{t("app_home")}</Link>
            <Link href="/issues">{t("app_issues")}</Link>
            {role === "CITIZEN" && <Link href="/issues/new">{t("app_new")}</Link>}
            <Link href="/map">{t("nav_mapp")}</Link>
            {role === "ADMIN" && (
              <>
                <Link href="/admin/users">{t("nav_users")}</Link>
                <Link href="/admin/departments">{t("nav_depts")}</Link>
              </>
            )}
            <Link href="/notifications">{t("nav_notif")}</Link>
            <Link href="/profile">{t("nav_profile")}</Link>
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