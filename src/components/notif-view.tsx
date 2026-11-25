"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { Icon } from "./icon";
import { markAllReadAction } from "@/lib/account-actions";
import type { Key } from "@/lib/dict";

export type Notif = { id: string; type: string; message: string; issueId: string | null; isRead: boolean; at: string };

export default function NotifView({ rows }: { rows: Notif[] }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const unread = rows.some((r) => !r.isRead);

  function text(n: Notif) {
    if (n.type === "STATUS") return `${t("nt_status")} ${t(`st_${n.message}` as Key)}`;
    if (n.type === "TASK") return `${t("nt_task")} ${n.message}`;
    return `${t("nt_new_issue")} ${n.message}`;
  }
  const icon = (ty: string) => (ty === "TASK" ? "wrench" : ty === "STATUS" ? "check" : "file");

  return (
    <>
      <h1 className="cp-pagetitle">{t("nt_title")}</h1>
      {unread && (
        <form action={markAllReadAction} style={{ marginBottom: 18 }}>
          <button className="cp-btn ghost" style={{ padding: "8px 18px" }}>{t("nt_readall")}</button>
        </form>
      )}
      {rows.length === 0 && <p className="cp-lead">{t("nt_empty")}</p>}
      <div className="cp-irows">
        {rows.map((n) => {
          const body = (
            <>
              <i className="cp-ico"><Icon name={icon(n.type)} /></i>
              <div className="tx">
                <b>{text(n)}</b>
                <small suppressHydrationWarning>{new Date(n.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}</small>
              </div>
            </>
          );
          return n.issueId ? (
            <Link key={n.id} href={`/issues/${n.issueId}`} className={`cp-ntrow ${n.isRead ? "" : "unread"}`}>{body}</Link>
          ) : (
            <div key={n.id} className={`cp-ntrow ${n.isRead ? "" : "unread"}`}>{body}</div>
          );
        })}
      </div>
    </>
  );
}