"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { updateStatusAction, assignAction, feedbackAction } from "@/lib/issue-actions";
import { STATUS_COLOR, PRIO_COLOR } from "@/lib/ui";
import type { Key } from "@/lib/dict";

export type Detail = {
  id: string; seq: number; images: string[]; title: string; description: string; status: string; priority: string;
  cat: string; catBn: string | null; dept: string; deptBn: string | null; address: string;
  lat: number; lng: number; votes: number; slaDueAt: string | null;
  reporter: string | null; assignee: string | null; rating: number | null;
  history: { id: string; from: string | null; to: string; by: string; note: string | null; at: string }[];
};
export type Can = { review: boolean; assign: boolean; start: boolean; done: boolean; close: boolean; reopen: boolean; rate: boolean };

function Move({ id, to, label, ghost }: { id: string; to: string; label: string; ghost?: boolean }) {
  return (
    <form action={updateStatusAction}>
      <input type="hidden" name="issueId" value={id} />
      <input type="hidden" name="to" value={to} />
      <button className={`cp-btn ${ghost ? "ghost" : ""}`}>{label}</button>
    </form>
  );
}

export default function IssueView({ d, can, staff }: { d: Detail; can: Can; staff: { id: string; name: string; load: number }[] }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const fmt = (iso: string) => new Date(iso).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" });
  const anyAction = Object.values(can).some(Boolean);

  const info: [Key, React.ReactNode][] = [
    ["dt_cat", lang === "bn" && d.catBn ? d.catBn : d.cat],
    ["dt_dept", lang === "bn" && d.deptBn ? d.deptBn : d.dept],
    ["dt_prio", <b key="p" style={{ color: PRIO_COLOR[d.priority] }}>{t(`pr_${d.priority}` as Key)}</b>],
    ["dt_sla", d.slaDueAt ? <span suppressHydrationWarning>{fmt(d.slaDueAt)}</span> : "-"],
    ["dt_reporter", d.reporter ?? t("dt_anon")],
    ["dt_assignee", d.assignee ?? "-"],
    ["dt_votes", d.votes.toLocaleString(loc)],
  ];

  return (
    <>
      <Link href="/issues" className="cp-back">{t("dt_back")}</Link>
      <div className="cp-dhead" style={{ "--pc": STATUS_COLOR[d.status] } as React.CSSProperties}>
        <span className="code">#CP-{d.seq.toLocaleString(loc, { useGrouping: false })}</span>
        <span className="cp-st">{t(`st_${d.status}` as Key)}</span>
      </div>
      <h1 className="cp-dtitle">{d.title}</h1>
      <p className="cp-ddesc">{d.description}</p>
      <p className="cp-daddr">{d.address} · <a href={`https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lng}#map=17/${d.lat}/${d.lng}`} target="_blank" rel="noreferrer">{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</a></p>

            {d.images.length > 0 && (
        <div className="cp-gallery">
          {d.images.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt="" />
          ))}
        </div>
      )}

      <div className="cp-dgrid">
        <div className="cp-card cp-dbox">
          <h3>{t("dt_act")}</h3>
          {!anyAction && <p className="cp-mute">{t("dt_none")}</p>}
          <div className="cp-row">
            {can.review && <Move id={d.id} to="UNDER_REVIEW" label={t("dt_review")} />}
            {can.start && <Move id={d.id} to="IN_PROGRESS" label={t("dt_start")} />}
            {can.done && <Move id={d.id} to="RESOLVED" label={t("dt_done")} />}
            {can.close && <Move id={d.id} to="CLOSED" label={t("dt_close")} />}
            {can.reopen && <Move id={d.id} to="IN_PROGRESS" label={t("dt_reopen")} ghost />}
          </div>
          {can.assign && (
            <form action={assignAction} className="cp-assign">
              <input type="hidden" name="issueId" value={d.id} />
              <select name="staffId" required defaultValue="">
                <option value="" disabled>{t("dt_pick")}</option>
                {staff.map((s, i) => (<option key={s.id} value={s.id}>{i === 0 ? "★ " : ""}{s.name} ({s.load})</option>))}
              </select>
                <button className="cp-btn">{t("dt_assign")}</button>
              <small className="cp-mute" style={{ width: "100%" }}>{t("dt_suggest")}</small>
            </form>
          )}
          {can.rate && (
            <form action={feedbackAction} className="cp-assign">
              <input type="hidden" name="issueId" value={d.id} />
              <select name="rating" defaultValue={d.rating ?? 5}>
                {[5, 4, 3, 2, 1].map((n) => (<option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>))}
              </select>
              <button className="cp-btn">{d.rating ? `${t("dt_rated")}: ${d.rating}` : t("dt_rate")}</button>
            </form>
          )}
        </div>

        <div className="cp-card cp-dbox">
          <dl className="cp-info">
            {info.map(([k, v]) => (<div key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>))}
          </dl>
        </div>
      </div>

      <h3 className="cp-tlh">{t("dt_tl")}</h3>
      <ul className="cp-tl cp-tlx">
        {d.history.map((h, i) => (
          <li key={h.id} className={i === d.history.length - 1 ? "n" : "d"}>
            {t(`st_${h.to}` as Key)}
            <small suppressHydrationWarning>{fmt(h.at)} · {t("dt_by")} {h.by}{h.note ? ` · ${h.note}` : ""}</small>
          </li>
        ))}
      </ul>
    </>
  );
}