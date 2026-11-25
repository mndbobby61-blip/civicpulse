"use client";
import { useActionState } from "react";
import { useLang } from "./lang-provider";
import { updateProfileAction, type ProfileState } from "@/lib/account-actions";
import type { Key } from "@/lib/dict";

const ERR: Record<string, Key> = { fields: "err_fields", wrong: "pf_wrong", weak: "err_weak" };

export default function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const { t } = useLang();
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfileAction, {});
  return (
    <>
      <h1 className="cp-pagetitle">{t("pf_title")}</h1>
      <form action={action} className="cp-formcard">
        {state.error && <p className="cp-err" role="alert">{t(ERR[state.error])}</p>}
        {state.ok && <p className="cp-ok" role="status">{t("pf_saved")}</p>}
        <label className="cp-field"><span>{t("pf_email")}</span><input value={email} readOnly disabled /></label>
        <label className="cp-field"><span>{t("pf_name")}</span><input name="name" defaultValue={name} required minLength={2} maxLength={80} /></label>
        <label className="cp-field"><span>{t("pf_phone")}</span><input name="phone" defaultValue={phone} maxLength={30} /></label>
        <label className="cp-field"><span>{t("pf_cur")}</span><input name="curPass" type="password" autoComplete="current-password" /></label>
        <label className="cp-field">
          <span>{t("pf_new")}</span>
          <input name="newPass" type="password" autoComplete="new-password" />
          <small>{t("auth_pass_hint")}</small>
        </label>
        <button className="cp-btn cp-submit" disabled={pending}>{pending ? t("auth_wait") : t("pf_save")}</button>
      </form>
    </>
  );
}