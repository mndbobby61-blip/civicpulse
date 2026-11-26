"use client";
import { useLang } from "./lang-provider";
import ProgressCard from "./progress-card";
import type { Progress } from "@/lib/gamify";
import type { Key } from "@/lib/dict";

export type LbRow = { rank: number; name: string; points: number; levelKey: string; isMe: boolean };

export default function LeaderboardView({ rows, me }: { rows: LbRow[]; me: { progress: Progress; rank: number | null } | null }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  return (
    <>
      <h1 className="cp-pagetitle">{t("lb_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 18 }}>{t("lb_lead")}</p>
      <p className="cp-mute" style={{ marginBottom: 24 }}><b>{t("lb_how")}:</b> {t("lb_how_txt")}</p>

      {me && (
        <div style={{ marginBottom: 28 }}>
          {me.rank && <p className="cp-mute" style={{ margin: "0 0 10px" }}>{t("lb_rank")}: <b>#{me.rank.toLocaleString(loc)}</b></p>}
          <ProgressCard p={me.progress} />
        </div>
      )}

      <div className="cp-irows">
        {rows.map((r) => (
          <div className={`cp-lrow ${r.isMe ? "me" : ""}`} key={r.rank}>
            <span className="rk">{r.rank.toLocaleString(loc)}</span>
            <b className="nm">{r.name}{r.isMe && <span className="cp-chip" style={{ color: "var(--g2)", marginLeft: 8, fontSize: 12 }}>{t("us_you")}</span>}</b>
            <span className="cp-chip" style={{ color: "var(--cp-amb)" }}>{t(r.levelKey as Key)}</span>
            <b>{r.points.toLocaleString(loc)} <small>{t("lb_points")}</small></b>
          </div>
        ))}
      </div>
    </>
  );
}