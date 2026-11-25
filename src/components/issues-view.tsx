"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "./lang-provider";
import { STATUSES, STATUS_COLOR, PRIO_COLOR } from "@/lib/ui";
import type { Key } from "@/lib/dict";

export type Row = {
  id: string; seq: number; title: string; status: string; priority: string;
  cat: string; catBn: string | null; area: string; at: string; votes: number;
};

function href(o: { q?: string; status?: string; page?: number }) {
  const p = new URLSearchParams();
  if (o.q) p.set("q", o.q);
  if (o.status) p.set("status", o.status);
  if (o.page && o.page > 1) p.set("page", String(o.page));
  const s = p.toString();
  return "/issues" + (s ? `?${s}` : "");
}

export default function IssuesView(props: { rows: Row[]; total: number; page: number; pages: number; q: string; status: string }) {
  const { rows, total, page, pages, q, status } = props;
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const router = useRouter();
  const [text, setText] = useState(q);

  // ডিবাউন্স সার্চ: টাইপ থামার ৪০০ms পরে সার্ভারে খোঁজে
  useEffect(() => {
    if (text === q) return;
    const h = setTimeout(() => router.replace(href({ q: text.trim(), status })), 400);
    return () => clearTimeout(h);
  }, [text, q, status, router]);

  return (
    <>
      <div className="cp-toolbar">
        <input className="cp-search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("iss_search")} />
        <span className="cp-count">{total.toLocaleString(loc)} {t("iss_count")}</span>
      </div>
      <div className="cp-filters">
        <Link href={href({ q })} className={!status ? "on" : ""}>{t("iss_all")}</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={href({ q, status: s })} className={status === s ? "on" : ""}>
            {t(`st_${s}` as Key)}
          </Link>
        ))}
      </div>

      {rows.length === 0 && <p className="cp-lead">{t("iss_empty")}</p>}
      <div className="cp-irows">
        {rows.map((r) => (
          <Link key={r.id} href={`/issues/${r.id}`} className="cp-card cp-irow" style={{ "--pc": STATUS_COLOR[r.status] } as React.CSSProperties}>
            <span className="code">#CP-{r.seq.toLocaleString(loc, { useGrouping: false })}</span>
            <div className="tx">
              <b>{r.title}</b>
              <small>
                {lang === "bn" && r.catBn ? r.catBn : r.cat} · {r.area} ·{" "}
                <span suppressHydrationWarning>{new Date(r.at).toLocaleDateString(loc)}</span>
              </small>
            </div>
            <span className="dotp" style={{ background: PRIO_COLOR[r.priority] }} title={t(`pr_${r.priority}` as Key)} />
            <span className="cp-st">{t(`st_${r.status}` as Key)}</span>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="cp-pager">
          {page > 1 ? <Link href={href({ q, status, page: page - 1 })}>{t("iss_prev")}</Link> : <span />}
          <b>{page.toLocaleString(loc)} / {pages.toLocaleString(loc)}</b>
          {page < pages ? <Link href={href({ q, status, page: page + 1 })}>{t("iss_next")}</Link> : <span />}
        </div>
      )}
    </>
  );
}