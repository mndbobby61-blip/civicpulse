"use client";
import { useLang } from "./lang-provider";
import { Icon } from "./icon";
import { toggleUpvoteAction, addCommentAction, deleteCommentAction } from "@/lib/engage-actions";
import type { Key } from "@/lib/dict";

type V = React.CSSProperties;
export type CommentRow = { id: string; name: string; role: string; text: string; at: string; canDelete: boolean };
export type Parts = { sev: number; votes: number; age: number; sla: number; total: number };

export default function Engage(props: {
  issueId: string; votes: number; voted: boolean; canVote: boolean; own: boolean;
  parts: Parts; comments: CommentRow[];
}) {
  const { issueId, votes, voted, canVote, own, parts: p, comments } = props;
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const bars: [Key, number, number][] = [
    ["ps_sev", p.sev, 40], ["ps_votes", p.votes, 20], ["ps_age", p.age, 20], ["ps_sla", p.sla, 20],
  ];

  return (
    <div className="cp-eng">
      <div className="cp-card cp-dbox">
        <form action={toggleUpvoteAction}>
          <input type="hidden" name="issueId" value={issueId} />
          <button className={`cp-upv ${voted ? "on" : ""}`} disabled={!canVote} title={own ? t("up_own") : undefined}>
            <Icon name="heart" /> {voted ? t("up_voted") : t("up_vote")} <b>{votes.toLocaleString(loc)}</b>
          </button>
        </form>
      </div>

      {p.total > 0 && (
        <div className="cp-card cp-dbox">
          <h3>{t("ps_title")}</h3>
          <div className="cp-scorewrap">
            <div className="cp-ring" style={{ "--pct": `${p.total}%` } as V}><b>{p.total.toLocaleString(loc)}</b></div>
            <div className="bars">
              {bars.map(([k, v, max]) => (
                <div className="cp-mini" key={k}>
                  <span>{t(k)}<b>{v.toLocaleString(loc)}</b></span>
                  <i style={{ "--w": `${(v / max) * 100}%` } as V} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="cp-card cp-dbox wide">
        <h3>{t("cmt_title")}</h3>
        {comments.length === 0 && <p className="cp-mute">{t("cmt_none")}</p>}
        {comments.map((c) => (
          <div className="cp-cm" key={c.id}>
            <span className="av">{c.name.charAt(0)}</span>
            <div className="tx">
              <b>{c.name}</b>
              <span className="cp-chip" style={{ color: "var(--g2)", marginLeft: 8, fontSize: 12 }}>
                {t(`role_${c.role.toLowerCase()}` as Key)}
              </span>
              <small suppressHydrationWarning>
                {new Date(c.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}
              </small>
              <p>{c.text}</p>
            </div>
            {c.canDelete && (
              <form action={deleteCommentAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="cp-linkbtn">{t("cmt_del")}</button>
              </form>
            )}
          </div>
        ))}
        <form action={addCommentAction} className="cp-cmform">
          <input type="hidden" name="issueId" value={issueId} />
          <textarea name="text" rows={2} required minLength={2} maxLength={500} placeholder={t("cmt_ph")} />
          <button className="cp-btn">{t("cmt_send")}</button>
        </form>
      </div>
    </div>
  );
}