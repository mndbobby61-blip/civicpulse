"use client";
import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { useLang } from "./lang-provider";
import { createIssueAction, type IssueState } from "@/lib/issue-actions";

const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => <div className="cp-skel" style={{ height: 320 }} />,
});

type Cat = { id: string; name: string; nameBn: string | null };

export default function IssueForm({ cats }: { cats: Cat[] }) {
  const { t, lang } = useLang();
  const [state, action, pending] = useActionState<IssueState, FormData>(createIssueAction, {});
  const [pos, setPos] = useState<[number, number] | null>(null);

  function locate() {
    navigator.geolocation?.getCurrentPosition((p) => setPos([p.coords.latitude, p.coords.longitude]));
  }

  return (
    <form action={action} className="cp-formcard">
      {state.error && <p className="cp-err" role="alert">{t("nf_err")}</p>}
      <label className="cp-field">
        <span>{t("nf_title")}</span>
        <input name="title" required minLength={5} maxLength={120} />
      </label>
      <label className="cp-field">
        <span>{t("nf_cat")}</span>
        <select name="categoryId" required defaultValue="">
          <option value="" disabled>-</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{lang === "bn" && c.nameBn ? c.nameBn : c.name}</option>
          ))}
        </select>
      </label>
      <label className="cp-field">
        <span>{t("nf_desc")}</span>
        <textarea name="description" rows={4} required minLength={10} maxLength={2000} />
      </label>
      <label className="cp-field">
        <span>{t("nf_addr")}</span>
        <input name="address" required maxLength={200} />
      </label>

      <div className="cp-field">
        <span>{t("nf_loc")}</span>
        <LocationPicker value={pos} onChange={(a, b) => setPos([a, b])} />
        <input type="hidden" name="lat" value={pos?.[0] ?? ""} />
        <input type="hidden" name="lng" value={pos?.[1] ?? ""} />
        <div className="cp-row" style={{ marginTop: 10, alignItems: "center" }}>
          <button type="button" className="cp-btn ghost" style={{ padding: "8px 18px" }} onClick={locate}>
            {t("nf_gps")}
          </button>
          {pos && <small>{pos[0].toFixed(5)}, {pos[1].toFixed(5)}</small>}
        </div>
      </div>

      <label className="cp-check">
        <input type="checkbox" name="anon" /> {t("nf_anon")}
      </label>
      <button className="cp-btn cp-submit" disabled={pending}>
        {pending ? t("auth_wait") : t("nf_submit")}
      </button>
    </form>
  );
}