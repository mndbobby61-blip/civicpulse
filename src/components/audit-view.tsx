"use client";
import Link from "next/link";
import { useLang } from "./lang-provider";

export type AuditRow = {
  id: string; action: string; entity: string; entityId: string | null;
  by: string | null; at: string; meta: string;
};
const ENTITIES = ["Issue", "User", "Department"];

function href(o: { entity?: string; page?: number }) {
  const p = new URLSearchParams();
  if (o.entity) p.set("entity", o.entity);
  if (o.page && o.page > 1) p.set("page", String(o.page));
  const s = p.toString();
  return "/admin/audit" + (s ? `?${s}` : "");
}

export default function AuditView(props: { rows: AuditRow[]; total: number; page: number; pages: number; entity: string }) {
  const { rows, total, page, pages, entity } = props;
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  return (
    <>
      <h1 className="cp-pagetitle">{t("au_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 16 }}>{t("au_lead")}</p>
      <div className="cp-toolbar">
        <span className="cp-count">{total.toLocaleString(loc)} {t("au_count")}</span>
      </div>
      <div className="cp-filters">
        <Link href={href({})} className={!entity ? "on" : ""}>{t("iss_all")}</Link>
        {ENTITIES.map((e) => (
          <Link key={e} href={href({ entity: e })} className={entity === e ? "on" : ""}>{e}</Link>
        ))}
      </div>
      {rows.length === 0 && <p className="cp-lead">{t("au_empty")}</p>}
      <div className="cp-irows">
        {rows.map((r) => (
          <div className="cp-arow" key={r.id}>
            <span className="cp-code">{r.action}</span>
            <div className="tx">
              <b>
                {r.entity}
                {r.entityId && r.entity === "Issue" ? (
                  <> · <Link href={`/issues/${r.entityId}`} style={{ color: "var(--g2)" }}>{r.entityId.slice(0, 8)}</Link></>
                ) : r.entityId ? ` · ${r.entityId.slice(0, 8)}` : ""}
              </b>
              <small>{t("au_by")}: {r.by ?? t("au_sys")}{r.meta ? ` · ${r.meta}` : ""}</small>
            </div>
            <small suppressHydrationWarning>{new Date(r.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}</small>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div className="cp-pager">
          {page > 1 ? <Link href={href({ entity, page: page - 1 })}>{t("iss_prev")}</Link> : <span />}
          <b>{page.toLocaleString(loc)} / {pages.toLocaleString(loc)}</b>
          {page < pages ? <Link href={href({ entity, page: page + 1 })}>{t("iss_next")}</Link> : <span />}
        </div>
      )}
    </>
  );
}