"use client";
import { useLang } from "./lang-provider";
import { createDeptAction, toggleDeptAction } from "@/lib/admin-actions";

export type DeptRow = {
  id: string; name: string; nameBn: string | null; isActive: boolean;
  manager: string | null; members: number; issues: number;
};

export default function DeptsView({ rows }: { rows: DeptRow[] }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  return (
    <>
      <h1 className="cp-pagetitle">{t("dp_title")}</h1>
      <form action={createDeptAction} className="cp-newdept">
        <label className="cp-field"><span>{t("dp_name")}</span><input name="name" required minLength={2} maxLength={60} /></label>
        <label className="cp-field"><span>{t("dp_namebn")}</span><input name="nameBn" maxLength={60} /></label>
        <button className="cp-btn">{t("dp_create")}</button>
      </form>

      <div className="cp-irows">
        {rows.map((d) => (
          <div className="cp-urow" key={d.id} style={{ opacity: d.isActive ? 1 : 0.6 }}>
            <div className="who">
              <b>{lang === "bn" && d.nameBn ? d.nameBn : d.name}</b>
              <small>{t("dp_manager")}: {d.manager ?? t("dp_nomgr")}</small>
              <small>{t("dp_members")}: {d.members.toLocaleString(loc)} · {t("dp_issues")}: {d.issues.toLocaleString(loc)}</small>
            </div>
            <span className="cp-st" style={{ "--pc": d.isActive ? "var(--g2)" : "var(--cp-mute)" } as React.CSSProperties}>
              {d.isActive ? t("dp_on") : t("dp_off")}
            </span>
            <form action={toggleDeptAction}>
              <input type="hidden" name="id" value={d.id} />
              <button className="cp-btn ghost">{t("dp_toggle")}</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}