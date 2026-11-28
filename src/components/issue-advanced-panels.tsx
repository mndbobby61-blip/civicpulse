"use client";
import { useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import {
  managerTriageAction,
  saveFeedbackReviewAction,
  saveInternalNoteAction,
  submitTaskReportAction,
} from "@/lib/advanced-actions";
import type { Key } from "@/lib/dict";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

export type AdvancedDetailProps = {
  issueId: string;
  currentPriority: string;
  currentCategoryId: string;
  reportImages: string[];
  completionImages: string[];
  taskReports: { id: string; description: string; photos: string[]; at: string }[];
  duplicateOf: { id: string; seq: number; title: string } | null;
  duplicates: { id: string; seq: number; title: string; status: string }[];
  categories: { id: string; name: string; nameBn: string | null; deptName: string }[];
  feedback: { rating: number; comment: string | null } | null;
  internalNotes: { id: string; text: string; by: string; role: string; at: string }[];
  // Timeline: status history + comments merged
  timeline: { id: string; type: "status" | "comment"; by: string; role: string; text: string; from?: string | null; to?: string; at: string }[];
  perms: {
    canStaffReport: boolean;
    canTriage: boolean;
    canReview: boolean;
    canSeeInternal: boolean;
  };
};

export default function IssueAdvancedPanels(props: AdvancedDetailProps) {
  const {
    issueId,
    currentPriority,
    currentCategoryId,
    reportImages,
    completionImages,
    taskReports,
    duplicateOf,
    duplicates,
    categories,
    feedback,
    internalNotes,
    timeline,
    perms,
  } = props;

  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const [sliderPct, setSliderPct] = useState(50);
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function uploadCompletionFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - proofPhotos.length);
    e.target.value = "";
    if (!files.length || !CLOUD || !PRESET) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) continue;
        const body = new FormData();
        body.append("file", f);
        body.append("upload_preset", PRESET);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
          method: "POST",
          body,
        });
        if (r.ok) {
          const json = (await r.json()) as { secure_url: string };
          urls.push(json.secure_url);
        }
      }
      setProofPhotos((prev) => [...prev, ...urls]);
    } finally {
      setBusy(false);
    }
  }

  const hasBeforeAfter = reportImages.length > 0 && completionImages.length > 0;
  const hasDuplicates = Boolean(duplicateOf) || duplicates.length > 0;

  return (
    <div className="cp-adv-grid">
      {/* 1. Real Before vs After Comparison Slider */}
      {hasBeforeAfter && (
        <div className="cp-adv-panel cp-adv-wide">
          <h3>{advT(lang, "ba_live_title")}</h3>
          <p className="cp-mute" style={{ marginTop: 0 }}>{advT(lang, "ba_live_hint")}</p>
          <div className="cp-ba-live">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={reportImages[0]} alt="Before repair" />
            <div className="after-layer" style={{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={completionImages[0]} alt="After repair" />
            </div>
            <span className="cp-ba-tag left">{t("ba_after")}</span>
            <span className="cp-ba-tag right">{t("ba_before")}</span>
            <div className="divider" style={{ left: `${sliderPct}%` }} />
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPct}
              onChange={(e) => setSliderPct(Number(e.target.value))}
              aria-label={t("ba_label")}
            />
          </div>
        </div>
      )}

      {/* 2. Duplicate Cluster Card */}
      {hasDuplicates && (
        <div className="cp-adv-panel">
          <h3>{advT(lang, "dup_cluster_title")}</h3>
          {duplicateOf && (
            <p>
              {advT(lang, "dup_parent")}{" "}
              <Link href={`/issues/${duplicateOf.id}`} style={{ color: "var(--g2)", fontWeight: 600 }}>
                #CP-{duplicateOf.seq} · {duplicateOf.title}
              </Link>
            </p>
          )}
          {duplicates.length > 0 && (
            <div>
              <p style={{ marginBottom: 8 }}>{advT(lang, "dup_children")}</p>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {duplicates.map((d) => (
                  <li key={d.id} style={{ marginBottom: 4 }}>
                    <Link href={`/issues/${d.id}`} style={{ color: "var(--g2)" }}>
                      #CP-{d.seq} · {d.title} ({t(`st_${d.status}` as Key)})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Manager Triage Panel (Priority Override & Category Re-route) */}
      {perms.canTriage && (
        <div className="cp-adv-panel">
          <h3>{advT(lang, "mg_triage_title")}</h3>
          <form action={managerTriageAction}>
            <input type="hidden" name="issueId" value={issueId} />
            <label className="cp-field">
              <span>{advT(lang, "mg_prio_label")}</span>
              <select name="priority" defaultValue={currentPriority}>
                {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((p) => (
                  <option key={p} value={p}>{t(`pr_${p}` as Key)}</option>
                ))}
              </select>
            </label>
            <label className="cp-field">
              <span>{advT(lang, "mg_cat_label")}</span>
              <select name="categoryId" defaultValue={currentCategoryId}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === "bn" && c.nameBn ? c.nameBn : c.name} ({c.deptName})
                  </option>
                ))}
              </select>
            </label>
            <label className="cp-field">
              <span>{advT(lang, "mg_triage_note")}</span>
              <input name="note" maxLength={200} />
            </label>
            <button className="cp-btn">{advT(lang, "mg_triage_save")}</button>
          </form>
        </div>
      )}

      {/* 4. Field Staff Progress & Completion Proof */}
      {(perms.canStaffReport || taskReports.length > 0) && (
        <div className="cp-adv-panel cp-adv-wide">
          <h3>{advT(lang, "tr_work_title")}</h3>
          {taskReports.length === 0 && (
            <p className="cp-mute">{advT(lang, "tr_work_empty")}</p>
          )}
          {taskReports.map((tr) => (
            <div key={tr.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--cp-line)" }}>
              <p style={{ margin: "0 0 6px" }}>{tr.description}</p>
              <small className="cp-mute" suppressHydrationWarning>
                {new Date(tr.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}
              </small>
              {tr.photos.length > 0 && (
                <div className="cp-gallery" style={{ marginTop: 10 }}>
                  {tr.photos.map((u) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={u} src={u} alt="Completion proof" />
                  ))}
                </div>
              )}
            </div>
          ))}

          {perms.canStaffReport && (
            <form action={submitTaskReportAction} style={{ marginTop: 16 }}>
              <input type="hidden" name="issueId" value={issueId} />
              <label className="cp-field">
                <span>{advT(lang, "tr_work_note")}</span>
                <textarea name="description" rows={3} required minLength={5} maxLength={1000} />
              </label>
              {CLOUD && PRESET && (
                <div className="cp-field">
                  <span>{advT(lang, "tr_work_photos")}</span>
                  {proofPhotos.length < 3 && (
                    <input type="file" accept="image/*" multiple onChange={uploadCompletionFiles} disabled={busy} />
                  )}
                  <div className="cp-thumbs">
                    {proofPhotos.map((u) => (
                      <div key={u}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" />
                        <button type="button" onClick={() => setProofPhotos(proofPhotos.filter((x) => x !== u))}>
                          ×
                        </button>
                        <input type="hidden" name="completionPhotos" value={u} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button className="cp-btn" disabled={busy}>
                {busy ? t("up_busy") : advT(lang, "tr_work_submit")}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 5. Citizen Written Feedback Comment */}
      {(perms.canReview || feedback?.comment) && (
        <div className="cp-adv-panel">
          <h3>{advT(lang, "fb_saved_review")}</h3>
          {feedback?.comment && (
            <p style={{ marginBottom: 14 }}>
              <b>{"★".repeat(feedback.rating)}{"☆".repeat(5 - feedback.rating)}</b> — {feedback.comment}
            </p>
          )}
          {perms.canReview && (
            <form action={saveFeedbackReviewAction}>
              <input type="hidden" name="issueId" value={issueId} />
              <label className="cp-field">
                <span>{t("dt_rate")}</span>
                <select name="rating" defaultValue={feedback?.rating ?? 5}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)}{"☆".repeat(5 - n)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cp-field">
                <span>{advT(lang, "fb_comment_label")}</span>
                <textarea
                  name="comment"
                  rows={2}
                  maxLength={500}
                  defaultValue={feedback?.comment ?? ""}
                  placeholder={advT(lang, "fb_comment_ph")}
                />
              </label>
              <button className="cp-btn">{advT(lang, "fb_comment_save")}</button>
            </form>
          )}
        </div>
      )}

      {/* 6. Internal Team Notes (Staff / Manager / Admin only) */}
      {perms.canSeeInternal && (
        <div className="cp-adv-panel">
          <h3>{advT(lang, "in_title")}</h3>
          {internalNotes.length === 0 && <p className="cp-mute">{advT(lang, "in_none")}</p>}
          {internalNotes.map((n) => (
            <div key={n.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--cp-line)" }}>
              <b>{n.by}</b> <span className="cp-chip" style={{ fontSize: 11 }}>{n.role}</span>
              <p style={{ margin: "4px 0" }}>{n.text}</p>
              <small className="cp-mute" suppressHydrationWarning>
                {new Date(n.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}
              </small>
            </div>
          ))}
          <form action={saveInternalNoteAction} style={{ marginTop: 14 }}>
            <input type="hidden" name="issueId" value={issueId} />
            <label className="cp-field">
              <textarea name="text" rows={2} required minLength={2} maxLength={500} placeholder={advT(lang, "in_ph")} />
            </label>
            <button className="cp-btn ghost">{advT(lang, "in_send")}</button>
          </form>
        </div>
      )}

      {/* 7. Activity Timeline */}
      {timeline.length > 0 && (
        <div className="cp-adv-panel cp-adv-wide">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ margin: 0 }}>{advT(lang, "tl_title")}</h3>
            <button
              type="button"
              className="cp-btn ghost"
              style={{ fontSize: 13, padding: "6px 14px" }}
              title={advT(lang, "print_hint")}
              onClick={() => window.print()}
            >
              🖨️ {advT(lang, "print_btn")}
            </button>
          </div>
          {timeline.length === 0 && <p className="cp-mute">{advT(lang, "tl_empty")}</p>}
          <div className="cp-timeline">
            {timeline.map((ev) => (
              <div key={ev.id} className={`cp-tl-item cp-tl-${ev.type}`}>
                <div className="cp-tl-dot" />
                <div className="cp-tl-body">
                  <div className="cp-tl-meta">
                    <b>{ev.by}</b>
                    <span className="cp-chip" style={{ fontSize: 11, marginLeft: 6 }}>{ev.role}</span>
                    <small className="cp-mute" suppressHydrationWarning style={{ marginLeft: 8 }}>
                      {new Date(ev.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}
                    </small>
                  </div>
                  {ev.type === "status" ? (
                    <p style={{ margin: "4px 0 0" }}>
                      <span className="cp-chip" style={{ background: "var(--cp-teal, #2de2c4)", color: "#000", fontSize: 12 }}>
                        {advT(lang, "tl_status_change")}
                      </span>
                      {ev.from && <>
                        {" "}<span style={{ opacity: 0.6 }}>{ev.from}</span>
                        {" → "}
                      </>}
                      <strong>{ev.to}</strong>
                      {ev.text && <span style={{ color: "var(--cp-mute, #8ea3ae)", marginLeft: 8, fontSize: 13 }}>({ev.text})</span>}
                    </p>
                  ) : (
                    <p style={{ margin: "4px 0 0" }}>
                      <span className="cp-chip" style={{ fontSize: 12 }}>{advT(lang, "tl_comment")}</span>
                      {" "}{ev.text}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
