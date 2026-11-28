"use client";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import { createCategoryAction, updateCategorySlaAction } from "@/lib/advanced-actions";

export type CategoryRow = {
  id: string;
  name: string;
  nameBn: string | null;
  icon: string | null;
  slaHours: number;
  deptName: string;
  deptNameBn: string | null;
  issueCount: number;
};

export type DeptOption = {
  id: string;
  name: string;
  nameBn: string | null;
};

export default function AdminCategoriesView({
  rows,
  depts,
}: {
  rows: CategoryRow[];
  depts: DeptOption[];
}) {
  const { lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";

  return (
    <>
      <h1 className="cp-pagetitle">{advT(lang, "ct_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 24 }}>{advT(lang, "ct_lead")}</p>

      <form action={createCategoryAction} className="cp-adv-panel" style={{ marginBottom: 24 }}>
        <div className="cp-adv-grid" style={{ marginTop: 0 }}>
          <label className="cp-field">
            <span>{advT(lang, "ct_name")}</span>
            <input name="name" required minLength={2} maxLength={60} />
          </label>
          <label className="cp-field">
            <span>{advT(lang, "ct_namebn")}</span>
            <input name="nameBn" maxLength={60} />
          </label>
          <label className="cp-field">
            <span>{advT(lang, "ct_dept")}</span>
            <select name="departmentId" required defaultValue="">
              <option value="" disabled>-</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>
                  {lang === "bn" && d.nameBn ? d.nameBn : d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="cp-field">
            <span>{advT(lang, "ct_sla")}</span>
            <input name="slaHours" type="number" min={1} max={720} defaultValue={48} required />
          </label>
        </div>
        <button className="cp-btn" style={{ marginTop: 8 }}>{advT(lang, "ct_create")}</button>
      </form>

      <div className="cp-irows">
        {rows.map((c) => (
          <div key={c.id} className="cp-urow">
            <div className="who">
              <b>{lang === "bn" && c.nameBn ? c.nameBn : c.name}</b>
              <small>
                {lang === "bn" && c.deptNameBn ? c.deptNameBn : c.deptName} · {c.issueCount.toLocaleString(loc)} issues
              </small>
            </div>
            <form action={updateCategorySlaAction} className="cp-row" style={{ alignItems: "center" }}>
              <input type="hidden" name="id" value={c.id} />
              <input
                name="slaHours"
                type="number"
                min={1}
                max={720}
                defaultValue={c.slaHours}
                style={{ width: 92, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--cp-line)", background: "var(--cp-bg)", color: "var(--cp-ink)" }}
                aria-label={advT(lang, "ct_sla")}
              />
              <button className="cp-btn ghost">{advT(lang, "ct_update")}</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
