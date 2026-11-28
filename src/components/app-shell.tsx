"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import LangToggle from "./lang-toggle";
import ThemeToggle from "./theme-toggle";
import NotifBell from "./notif-bell";
import LiveStreamBadge from "./live-stream-badge";
import LogoutButton from "./logout-button";
import GlobalSearch from "./global-search";

const HOME: Record<string, string> = { ADMIN: "/admin", MANAGER: "/manager", STAFF: "/staff", CITIZEN: "/citizen" };

export default function AppShell({ role, home, children }: { role: string; home?: string; children: React.ReactNode }) {
  const { t, lang } = useLang();
  return (
    <div className="cp-wrap cp-dash">
      <div className="cp-dtop">
        <div className="cp-row" style={{ alignItems: "center", gap: 18 }}>
          <Link href="/" className="cp-logo">CivicPulse</Link>
          <nav className="cp-appnav">
            <Link href={home ?? HOME[role] ?? "/"}>{t("app_home")}</Link>
            <Link href="/issues">{t("app_issues")}</Link>
            {role === "CITIZEN" && <Link href="/issues/new">{t("app_new")}</Link>}
            {role === "STAFF" && <Link href="/staff/route">{advT(lang, "nav_route")}</Link>}
            <Link href="/map">{t("nav_mapp")}</Link>
            <Link href="/map/zones">{advT(lang, "nav_zones")}</Link>
            <Link href="/city-3d">{advT(lang, "nav_city3d")}</Link>
            <Link href="/areas">{advT(lang, "nav_areas")}</Link>
            <Link href="/leaderboard">{t("nav_board")}</Link>
            {(role === "ADMIN" || role === "MANAGER") && <Link href="/admin/reports">{advT(lang, "nav_reports")}</Link>}
            {role === "ADMIN" && (
              <>
                <Link href="/admin/users">{t("nav_users")}</Link>
                <Link href="/admin/departments">{t("nav_depts")}</Link>
                <Link href="/admin/categories">{advT(lang, "nav_cats")}</Link>
                <Link href="/admin/settings">{advT(lang, "nav_settings")}</Link>
                <Link href="/admin/audit">{t("nav_audit")}</Link>
              </>
            )}
            <Link href="/notifications">{t("nav_notif")}</Link>
            <Link href="/profile">{t("nav_profile")}</Link>
          </nav>
        </div>
        <div className="cp-row" style={{ alignItems: "center", flexWrap: "nowrap" }}>
          <GlobalSearch />
          <LiveStreamBadge />
          <NotifBell />
          <ThemeToggle />
          <LangToggle />
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}