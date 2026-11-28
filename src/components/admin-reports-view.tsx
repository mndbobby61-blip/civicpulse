"use client";
import { useState } from "react";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import { STATUSES } from "@/lib/ui";
import type { Key } from "@/lib/dict";

export type ReportSummary = {
  scopeLabel: string;
  total: number;
  resolved: number;
  overdue: number;
  avgRating: number | null;
  depts: { name: string; nameBn: string | null; total: number; resolved: number; overdue: number }[];
};

export default function AdminReportsView({ summary }: { summary: ReportSummary }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Build export URL with all filters
  function buildUrl(format: "csv" | "json") {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (fromDate) p.set("from", fromDate);
    if (toDate) p.set("to", toDate);
    if (format === "json") p.set("format", "json");
    const q = p.toString();
    return `/api/export${q ? `?${q}` : ""}`;
  }

  return (
    <>
      <h1 className="cp-pagetitle">{advT(lang, "rp_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 20 }}>{advT(lang, "rp_lead")}</p>

      <div className="cp-adv-panel cp-no-print">
        {/* Filters row */}
        <div className="cp-row" style={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div className="cp-filters" style={{ margin: 0 }}>
            <button type="button" className={!status ? "on" : ""} onClick={() => setStatus("")}>
              {t("iss_all")}
            </button>
            {STATUSES.map((s) => (
              <button key={s} type="button" className={status === s ? "on" : ""} onClick={() => setStatus(s)}>
                {t(`st_${s}` as Key)}
              </button>
            ))}
          </div>

          {/* Date range filter */}
          <div className="cp-row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <span className="cp-mute">{advT(lang, "exp_from")}:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid var(--cp-line)", background: "var(--cp-card)", color: "var(--cp-ink)", fontSize: 13 }}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <span className="cp-mute">{advT(lang, "exp_to")}:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid var(--cp-line)", background: "var(--cp-card)", color: "var(--cp-ink)", fontSize: 13 }}
              />
            </label>
          </div>

          {/* Export buttons */}
          <div className="cp-row" style={{ gap: 8 }}>
            <a href={buildUrl("csv")} className="cp-btn" download>
              {advT(lang, "rp_csv")}
            </a>
            <a href={buildUrl("json")} className="cp-btn ghost" download>
              {advT(lang, "exp_json")}
            </a>
            <button type="button" className="cp-btn ghost" onClick={() => window.print()}>
              🖨️ {advT(lang, "rp_pdf")}
            </button>
          </div>
        </div>
      </div>

      <div className="cp-adv-panel">
        <div className="cp-row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
          <h3>{advT(lang, "rp_summary")} — {summary.scopeLabel}</h3>
          <small className="cp-mute" suppressHydrationWarning>
            {advT(lang, "rp_generated")}: {new Date().toLocaleDateString(loc)}
          </small>
        </div>

        <div className="cp-stats" style={{ marginTop: 16 }}>
          <div className="cp-stat">
            <b>{summary.total.toLocaleString(loc)}</b>
            <span>{t("dash_total")}</span>
          </div>
          <div className="cp-stat">
            <b>{summary.resolved.toLocaleString(loc)}</b>
            <span>{t("dash_resolved")}</span>
          </div>
          <div className="cp-stat">
            <b>{summary.overdue.toLocaleString(loc)}</b>
            <span>{t("sla_overdue")}</span>
          </div>
          <div className="cp-stat">
            <b>{summary.avgRating !== null ? summary.avgRating.toFixed(1) : "-"}</b>
            <span>{advT(lang, "ar_sat")}</span>
          </div>
          <div className="cp-stat">
            <b>{summary.total > 0 ? `${Math.round((summary.resolved / summary.total) * 100)}%` : "—"}</b>
            <span>{advT(lang, "ctz_resolved_pct")}</span>
          </div>
        </div>

        <div className="cp-irows" style={{ marginTop: 22 }}>
          {summary.depts.map((d) => {
            const pct = d.total ? Math.round((d.resolved / d.total) * 100) : 0;
            return (
              <div key={d.name} className="cp-urow">
                <div className="who">
                  <b>{lang === "bn" && d.nameBn ? d.nameBn : d.name}</b>
                  <small>
                    {t("dash_total")}: {d.total.toLocaleString(loc)} · {t("dash_resolved")}: {d.resolved.toLocaleString(loc)} ({pct}%) · {t("sla_overdue")}: {d.overdue.toLocaleString(loc)}
                  </small>
                </div>
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 80, height: 6, background: "var(--cp-line)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--g2)", borderRadius: 4 }} />
                  </div>
                  <span className="cp-chip" style={{ color: "var(--g2)" }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
