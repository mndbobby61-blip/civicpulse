"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "./lang-provider";
import { updateUserAction } from "@/lib/admin-actions";
import type { Key } from "@/lib/dict";

export type UserRow = {
  id: string; name: string; email: string; role: string;
  departmentId: string | null; isActive: boolean; isSelf: boolean;
};
type Dept = { id: string; name: string; nameBn: string | null };
const ROLES = ["ADMIN", "MANAGER", "STAFF", "CITIZEN"];

function href(o: { q?: string; role?: string; page?: number }) {
  const p = new URLSearchParams();
  if (o.q) p.set("q", o.q);
  if (o.role) p.set("role", o.role);
  if (o.page && o.page > 1) p.set("page", String(o.page));
  const s = p.toString();
  return "/admin/users" + (s ? `?${s}` : "");
}

export default function UsersView(props: {
  rows: UserRow[]; depts: Dept[]; total: number; page: number; pages: number; q: string; role: string;
}) {
  const { rows, depts, total, page, pages, q, role } = props;
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const router = useRouter();
  const [text, setText] = useState(q);

  useEffect(() => {
    if (text === q) return;
    const h = setTimeout(() => router.replace(href({ q: text.trim(), role })), 400);
    return () => clearTimeout(h);
  }, [text, q, role, router]);

  return (
    <>
      <h1 className="cp-pagetitle">{t("us_title")}</h1>
      <div className="cp-toolbar">
        <input className="cp-search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("us_search")} />
        <span className="cp-count">{total.toLocaleString(loc)} {t("us_count")}</span>
      </div>
      <div className="cp-filters">
        <Link href={href({ q })} className={!role ? "on" : ""}>{t("iss_all")}</Link>
        {ROLES.map((r) => (
          <Link key={r} href={href({ q, role: r })} className={role === r ? "on" : ""}>
            {t(`role_${r.toLowerCase()}` as Key)}
          </Link>
        ))}
      </div>

      <div className="cp-irows">
        {rows.map((u) => (
          <div className="cp-urow" key={u.id}>
            <div className="who">
              <b>{u.name} {u.isSelf && <span className="cp-chip" style={{ color: "var(--g2)", marginLeft: 6 }}>{t("us_you")}</span>}</b>
              <small>{u.email}</small>
            </div>
            <form action={updateUserAction}>
              <input type="hidden" name="id" value={u.id} />
              <select name="role" defaultValue={u.role} disabled={u.isSelf}>
                {ROLES.map((r) => (<option key={r} value={r}>{t(`role_${r.toLowerCase()}` as Key)}</option>))}
              </select>
              <select name="departmentId" defaultValue={u.departmentId ?? ""}>
                <option value="">-</option>
                {depts.map((d) => (<option key={d.id} value={d.id}>{lang === "bn" && d.nameBn ? d.nameBn : d.name}</option>))}
              </select>
              <label><input type="checkbox" name="isActive" defaultChecked={u.isActive} disabled={u.isSelf} /> {t("us_active")}</label>
              <button className="cp-btn">{t("us_save")}</button>
            </form>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="cp-pager">
          {page > 1 ? <Link href={href({ q, role, page: page - 1 })}>{t("iss_prev")}</Link> : <span />}
          <b>{page.toLocaleString(loc)} / {pages.toLocaleString(loc)}</b>
          {page < pages ? <Link href={href({ q, role, page: page + 1 })}>{t("iss_next")}</Link> : <span />}
        </div>
      )}
    </>
  );
}