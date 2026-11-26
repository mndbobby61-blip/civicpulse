"use client";
import { useLang } from "./lang-provider";
import { Icon } from "./icon";
import type { Progress } from "@/lib/gamify";
import type { Key } from "@/lib/dict";

type V = React.CSSProperties;
const ICONS = ["file", "road", "shield", "check", "smile", "chart"];

export default function ProgressCard({ p }: { p: Progress }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const stats: [Key, number][] = [
    ["lb_s1", p.stat.reports], ["lb_s2", p.stat.resolved], ["lb_s3", p.stat.ratings], ["lb_s4", p.stat.votes],
  ];
  return (
    <div className="cp-prog">
      <div className="top">
        <div>
          <small>{t("lb_level")}</small>
          <h3>{t(p.levelKey as Key)}</h3>
        </div>
        <div className="pts"><b>{p.points.toLocaleString(loc)}</b><small>{t("lb_points")}</small></div>
      </div>
      <div className="cp-mini">
        <i style={{ "--w": `${p.pct}%` } as V} />
        <span>
          {p.next === null
            ? t("lb_max")
            : `${t("lb_next")}: ${(p.next - p.points).toLocaleString(loc)} ${t("lb_points")}`}
        </span>
      </div>
      <div className="cp-pstats">
        {stats.map(([k, v]) => (
          <div key={k}><b>{v.toLocaleString(loc)}</b><small>{t(k)}</small></div>
        ))}
      </div>
      <h4>{t("lb_badges")}</h4>
      <div className="cp-badges">
        {ICONS.map((ic, i) => {
          const on = p.badges.includes(i + 1);
          return (
            <div className={`cp-badge ${on ? "" : "off"}`} key={i}>
              <i className="cp-ico"><Icon name={ic} /></i>
              <b>{t(`bd_${i + 1}t` as Key)}</b>
              <small>{t(`bd_${i + 1}d` as Key)}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}