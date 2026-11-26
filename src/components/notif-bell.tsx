"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { useMe } from "./me-provider";
import { Icon } from "./icon";
import { notifText } from "@/lib/notif-text";

export default function NotifBell() {
  const { me, items, unread, markRead } = useMe();
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  if (!me) return null;

  return (
    <div className="cp-bell" ref={ref}>
      <button className="cp-bellbtn" aria-label={t("nt_title")} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg aria-hidden="true"><use href="#i-bell" /></svg>
        {unread > 0 && <span className="badge">{unread > 9 ? "9+" : unread.toLocaleString(loc)}</span>}
      </button>
      {open && (
        <div className="cp-bellpanel">
          <div className="hd">
            <b>{t("nt_title")}</b>
            {unread > 0 && <button onClick={() => markRead()}>{t("nt_readall")}</button>}
          </div>
          {items.length === 0 && <p>{t("nt_empty")}</p>}
          {items.slice(0, 6).map((n) => (
            <Link
              key={n.id}
              href={n.issueId ? `/issues/${n.issueId}` : "/notifications"}
              className={`it ${n.isRead ? "" : "unread"}`}
              onClick={() => { markRead([n.id]); setOpen(false); }}
            >
              <i className="cp-ico"><Icon name={n.type === "TASK" ? "wrench" : n.type === "STATUS" ? "check" : "file"} /></i>
              <div>
                <b>{notifText(n, t)}</b>
                <small>{new Date(n.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}</small>
              </div>
            </Link>
          ))}
          <Link href="/notifications" className="all" onClick={() => setOpen(false)}>{t("bell_all")}</Link>
        </div>
      )}
    </div>
  );
}