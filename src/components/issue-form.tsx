"use client";
import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { useLang } from "./lang-provider";
import { createIssueAction, type IssueState } from "@/lib/issue-actions";
import IssueAssistant from "./issue-assistant";

const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => <div className="cp-skel" style={{ height: 320 }} />,
});

type Cat = { id: string; name: string; nameBn: string | null };

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

export default function IssueForm({ cats }: { cats: Cat[] }) {
  const { t, lang } = useLang();
  const [state, action, pending] = useActionState<IssueState, FormData>(createIssueAction, {});
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [address, setAddress] = useState("");
  const [areaName, setAreaName] = useState("");
  const [imgs, setImgs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [upErr, setUpErr] = useState(false);

  function locate() {
    navigator.geolocation?.getCurrentPosition((p) => setPos([p.coords.latitude, p.coords.longitude]));
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - imgs.length);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setUpErr(false);
    try {
      const urls: string[] = [];
      for (const f of files) {
        if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) throw new Error("bad file");
        const body = new FormData();
        body.append("file", f);
        body.append("upload_preset", PRESET!);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body });
        if (!r.ok) throw new Error("upload failed");
        urls.push((await r.json()).secure_url as string);
      }
      setImgs((prev) => [...prev, ...urls]);
    } catch {
      setUpErr(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={action} className="cp-formcard">
      {state.error && <p className="cp-err" role="alert">{t("nf_err")}</p>}
      <IssueAssistant
        title={title}
        description={description}
        categoryId={categoryId}
        address={address}
        areaName={areaName}
        imageUrl={imgs[0] ?? ""}
        pos={pos}
        cats={cats}
        onApplyTitle={setTitle}
        onApplyDescription={setDescription}
        onApplyCategory={setCategoryId}
        onApplyAddress={(addr, area) => {
          setAddress(addr);
          setAreaName(area);
        }}
        onApplyPos={(lat, lng) => setPos([lat, lng])}
      />
      <input type="hidden" name="areaName" value={areaName} />
      <label className="cp-field">
        <span>{t("nf_title")}</span>
        <input name="title" required minLength={5} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="cp-field">
        <span>{t("nf_cat")}</span>
        <select name="categoryId" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="" disabled>-</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{lang === "bn" && c.nameBn ? c.nameBn : c.name}</option>
          ))}
        </select>
      </label>
      <label className="cp-field">
        <span>{t("nf_desc")}</span>
        <textarea name="description" rows={4} required minLength={10} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="cp-field">
        <span>{t("nf_addr")}</span>
        <input name="address" required maxLength={200} value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>

      {CLOUD && PRESET && (
        <div className="cp-field">
          <span>{t("up_label")}</span>
          {imgs.length < 3 && (
            <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} />
          )}
          {busy && <small>{t("up_busy")}</small>}
          {upErr && <p className="cp-err" role="alert" style={{ marginTop: 8 }}>{t("up_fail")}</p>}
          <div className="cp-thumbs">
            {imgs.map((u) => (
              <div key={u}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" />
                <button type="button" aria-label="remove" onClick={() => setImgs(imgs.filter((x) => x !== u))}>×</button>
                <input type="hidden" name="images" value={u} />
              </div>
            ))}
          </div>
        </div>
      )}

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
      <button className="cp-btn cp-submit" disabled={pending || busy}>
        {pending ? t("auth_wait") : t("nf_submit")}
      </button>
    </form>
  );
}