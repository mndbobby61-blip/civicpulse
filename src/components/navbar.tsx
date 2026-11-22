"use client";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";

export default function Navbar() {
  const { t } = useLang();
  return (
    <nav className="cp-nav">
      <div className="cp-logo">
        <svg viewBox="0 0 34 18" aria-hidden="true">
          <path d="M0 9h9l3-7 5 14 4-10 2 3h11" fill="none" stroke="var(--g2)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        CivicPulse
      </div>
      <div className="cp-links">
        <a href="#how">{t("nav_how")}</a>
        <a href="#map">{t("nav_map")}</a>
        <a href="#rank">{t("nav_rank")}</a>
        <a href="#faq">{t("nav_faq")}</a>
      </div>
      <div className="cp-row" style={{ alignItems: "center", flexWrap: "nowrap" }}>
        <LangToggle />
        <button className="cp-btn" style={{ padding: "10px 22px" }}>{t("nav_cta")}</button>
      </div>
    </nav>
  );
}