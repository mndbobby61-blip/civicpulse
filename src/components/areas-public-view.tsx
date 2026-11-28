"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";

export type AreaCardRow = {
  area: string;
  total: number;
  resolved: number;
  avgHours: number | null;
  avgRating: number | null;
  topCategory: string;
  topCategoryBn: string | null;
};

export default function AreasPublicView({
  rows,
  loggedIn,
}: {
  rows: AreaCardRow[];
  loggedIn: boolean;
}) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";

  return (
    <>
      {!loggedIn && <Link href="/" className="cp-back">← CivicPulse</Link>}
      <h1 className="cp-pagetitle">{advT(lang, "ar_page_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 20 }}>{advT(lang, "ar_page_lead")}</p>

      {rows.length === 0 ? (
        <p className="cp-lead">{t("ar_empty")}</p>
      ) : (
        <div className="cp-score-grid">
          {rows.map((r) => {
            const rate = r.total ? Math.round((r.resolved / r.total) * 100) : 0;
            return (
              <div key={r.area} className="cp-adv-panel" style={{ marginTop: 0 }}>
                <div className="cp-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 18 }}>{r.area}</b>
                  <span className="cp-chip" style={{ color: "var(--g2)" }}>{rate}%</span>
                </div>
                <div className="cp-bar-track">
                  <div className="cp-bar-fill" style={{ width: `${rate}%` }} />
                </div>
                <div style={{ marginTop: 14, fontSize: 14, display: "grid", gap: 6 }}>
                  <div>
                    {t("ar_total")}: <b>{r.total.toLocaleString(loc)}</b> · {t("ar_solved")}:{" "}
                    <b>{r.resolved.toLocaleString(loc)}</b>
                  </div>
                  <div>
                    {advT(lang, "ar_avg_h")}:{" "}
                    <b>{r.avgHours !== null ? `${r.avgHours.toLocaleString(loc)}h` : "-"}</b> ·{" "}
                    {advT(lang, "ar_sat")}:{" "}
                    <b>{r.avgRating !== null ? `${r.avgRating.toFixed(1)} ★` : "-"}</b>
                  </div>
                  <div className="cp-mute">
                    {lang === "bn" && r.topCategoryBn ? r.topCategoryBn : r.topCategory}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
