"use client";
import { useState } from "react";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import { saveSettingsAction } from "@/lib/advanced-actions";

export type SettingsMap = {
  duplicateRadiusM: string;
  maxImages: string;
  bannerBn: string;
  bannerEn: string;
};

export default function AdminSettingsView({ initial }: { initial: SettingsMap }) {
  const { lang } = useLang();
  const [saved, setSaved] = useState(false);

  async function onSubmit(fd: FormData) {
    setSaved(false);
    await saveSettingsAction(fd);
    setSaved(true);
  }

  return (
    <>
      <h1 className="cp-pagetitle">{advT(lang, "st_title")}</h1>
      <p className="cp-lead" style={{ marginBottom: 24 }}>{advT(lang, "st_lead")}</p>

      <form action={onSubmit} className="cp-formcard">
        {saved && (
          <p className="cp-chip" style={{ color: "var(--g2)", marginBottom: 14 }}>
            {advT(lang, "st_saved")}
          </p>
        )}
        <label className="cp-field">
          <span>{advT(lang, "st_dup_m")}</span>
          <input name="duplicateRadiusM" type="number" min={10} max={500} defaultValue={initial.duplicateRadiusM} required />
        </label>
        <label className="cp-field">
          <span>{advT(lang, "st_max_img")}</span>
          <input name="maxImages" type="number" min={1} max={6} defaultValue={initial.maxImages} required />
        </label>
        <label className="cp-field">
          <span>{advT(lang, "st_banner_bn")}</span>
          <input name="bannerBn" maxLength={240} defaultValue={initial.bannerBn} />
        </label>
        <label className="cp-field">
          <span>{advT(lang, "st_banner_en")}</span>
          <input name="bannerEn" maxLength={240} defaultValue={initial.bannerEn} />
        </label>
        <button className="cp-btn cp-submit">{advT(lang, "st_save")}</button>
      </form>
    </>
  );
}
