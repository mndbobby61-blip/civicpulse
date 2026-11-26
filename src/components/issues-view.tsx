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
  score: number; late: boolean; hours: number | null;
};
type Q = { q?: string; status?: string; page?: number; sort?: string; scope?: string };

function href(o: Q) {
  const p = new URLSearchParams();
  if (o.q) p.set("q", o.q);
  if (o.status) p.set("status", o.status);
  if (o.sort) p.set("sort", o.sort);
  if (o.scope) p.set("scope", o.scope);
  if (o.page && o.page > 1) p.set("page", String(o.page));
  const s = p.toString();
  return "/issues" + (s ? `?${s}` : "");
}

export default function IssuesView(props: {
  rows: Row[]; total: number; page: number; pages: number; q: string;
  status: string; sort: string; scope: string; isCitizen: boolean;
}) {
  const { rows, total, page, pages, q, status, sort, scope, isCitizen } = props;
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const router = useRouter();
  const [text, setText] = useState(q);
  const b = { q, status, sort, scope };

  useEffect(() => {
    if (text === q) return;
    const h = setTimeout(() => router.replace(href({ ...b, q: text.trim() })), 400);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <>
      <div className="cp-toolbar">
        <input className="cp-search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("iss_search")} />
        <span className="cp-count">{total.toLocaleString(loc)} {t("iss_count")}</span>
      </div>

      {isCitizen && (
        <div className="cp-filters">
          <Link href={href({ ...b, scope: "", page: 1 })} className={!scope ? "on" : ""}>{t("sp_mine")}</Link>
          <Link href={href({ ...b, scope: "all", page: 1 })} className={scope ? "on" : ""}>{t("sp_all")}</Link>
        </div>
      )}
      <div className="cp-filters">
        <Link href={href({ ...b, status: "", page: 1 })} className={!status ? "on" : ""}>{t("iss_all")}</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={href({ ...b, status: s, page: 1 })} className={status === s ? "on" : ""}>
            {t(`st_${s}` as Key)}
          </Link>
        ))}
      </div>
      <div className="cp-filters">
        <Link href={href({ ...b, sort: "", page: 1 })} className={!sort ? "on" : ""}>{t("sort_new")}</Link>
        <Link href={href({ ...b, sort: "priority", page: 1 })} className={sort ? "on" : ""}>{t("sort_prio")}</Link>
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
            {r.score > 0 && <span className="cp-score" title={t("ps_title")}>⚡ {r.score.toLocaleString(loc)}</span>}
            {r.late && <span className="cp-late">{t("sla_overdue")}</span>}
            <span className="dotp" style={{ background: PRIO_COLOR[r.priority] }} title={t(`pr_${r.priority}` as Key)} />
            <span className="cp-st">{t(`st_${r.status}` as Key)}</span>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="cp-pager">
          {page > 1 ? <Link href={href({ ...b, page: page - 1 })}>{t("iss_prev")}</Link> : <span />}
          <b>{page.toLocaleString(loc)} / {pages.toLocaleString(loc)}</b>
          {page < pages ? <Link href={href({ ...b, page: page + 1 })}>{t("iss_next")}</Link> : <span />}
        </div>
      )}
    </>
  );
}