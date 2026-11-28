"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";

type Cat = { id: string; name: string; nameBn: string | null };
type DupMatch = { id: string; seq: number; title: string; upvoteCount: number; address: string } | null;
type OfflineDraft = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  address: string;
  areaName: string;
  pos: [number, number] | null;
  savedAt: number;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type Props = {
  title: string;
  description: string;
  categoryId: string;
  address: string;
  areaName: string;
  imageUrl: string;
  pos: [number, number] | null;
  cats: Cat[];
  onApplyTitle: (val: string) => void;
  onApplyDescription: (val: string) => void;
  onApplyCategory: (id: string) => void;
  onApplyAddress: (addr: string, area: string) => void;
  onApplyPos: (lat: number, lng: number) => void;
};

const QUEUE_KEY = "cp-offline-queue-v1";

function readQueue(): OfflineDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function IssueAssistant(props: Props) {
  const {
    title,
    description,
    categoryId,
    address,
    areaName,
    imageUrl,
    pos,
    cats,
    onApplyTitle,
    onApplyDescription,
    onApplyCategory,
    onApplyAddress,
    onApplyPos,
  } = props;

  const { lang } = useLang();
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceErr, setVoiceErr] = useState(false);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(() => readQueue().length);
  const [dup, setDup] = useState<DupMatch>(null);
  const [offline, setOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const goOff = () => setOffline(true);
    const goOn = () => setOffline(false);
    window.addEventListener("offline", goOff);
    window.addEventListener("online", goOn);
    return () => {
      window.removeEventListener("offline", goOff);
      window.removeEventListener("online", goOn);
    };
  }, []);

  useEffect(() => {
    if (!categoryId || !pos || offline) {
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/duplicate-check?categoryId=${encodeURIComponent(categoryId)}&lat=${pos[0]}&lng=${pos[1]}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { match: DupMatch };
        if (active) setDup(data.match);
      } catch {
        // Ignore network error during live duplicate check
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [categoryId, pos, offline]);

  async function runAiTriage() {
    if (!title.trim() && !description.trim() && !imageUrl) return;
    setAiBusy(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/ai-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, imageUrl: imageUrl || undefined }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        categoryId: string | null;
        categoryName: string | null;
        priority: string;
        source: string;
      };
      if (data.categoryId) {
        onApplyCategory(data.categoryId);
        const matched = cats.find((c) => c.id === data.categoryId);
        const catLabel = matched
          ? lang === "bn" && matched.nameBn
            ? matched.nameBn
            : matched.name
          : data.categoryName ?? "";
        setAiNote(`${advT(lang, "as_ai_ok")} ${catLabel} (${data.priority} · ${data.source})`);
      }
    } finally {
      setAiBusy(false);
    }
  }

  async function fillAddressFromPin() {
    if (!pos) {
      setAiNote(advT(lang, "as_geo_need"));
      return;
    }
    setGeoBusy(true);
    try {
      const res = await fetch(`/api/geocode?lat=${pos[0]}&lng=${pos[1]}`);
      if (!res.ok) return;
      const data = (await res.json()) as { address?: string; areaName?: string | null };
      if (data.address) {
        onApplyAddress(data.address, data.areaName ?? "");
      }
    } finally {
      setGeoBusy(false);
    }
  }

  function toggleVoice() {
    setVoiceErr(false);
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceErr(true);
      return;
    }
    const rec = new Ctor();
    rec.lang = lang === "bn" ? "bn-BD" : "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const spoken = ev.results?.[0]?.[0]?.transcript?.trim();
      if (!spoken) return;
      if (!title.trim()) {
        onApplyTitle(spoken.slice(0, 110));
      } else {
        onApplyDescription(description ? `${description} ${spoken}` : spoken);
      }
    };
    rec.onerror = () => {
      setListening(false);
      setVoiceErr(true);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function saveDraftOffline() {
    try {
      const q = readQueue();
      const next: OfflineDraft[] = [
        {
          id: String(Date.now()),
          title,
          description,
          categoryId,
          address,
          areaName,
          pos,
          savedAt: Date.now(),
        },
        ...q,
      ].slice(0, 10);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      setQueueCount(next.length);
      setDraftMsg(advT(lang, "as_draft_saved"));
    } catch {
      // Ignore storage quota error
    }
  }

  function loadLatestDraft() {
    const q = readQueue();
    const d = q[0];
    if (!d) return;
    if (d.title) onApplyTitle(d.title);
    if (d.description) onApplyDescription(d.description);
    if (d.categoryId) onApplyCategory(d.categoryId);
    if (d.address) onApplyAddress(d.address, d.areaName ?? "");
    if (Array.isArray(d.pos) && d.pos.length === 2) onApplyPos(d.pos[0], d.pos[1]);
    const rest = q.slice(1);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(rest));
    setQueueCount(rest.length);
    setDraftMsg(null);
  }

  return (
    <div className="cp-assist">
      <div className="cp-assist-head">
        <b style={{ fontSize: 15 }}>{advT(lang, "as_title")}</b>
        <div className="cp-assist-btns">
          <button
            type="button"
            className="cp-btn-sm"
            onClick={runAiTriage}
            disabled={aiBusy || (!title.trim() && !description.trim() && !imageUrl)}
          >
            {aiBusy ? advT(lang, "as_ai_busy") : advT(lang, "as_ai")}
          </button>
          <button
            type="button"
            className={`cp-btn-sm ${listening ? "active" : ""}`}
            onClick={toggleVoice}
          >
            {listening ? advT(lang, "as_voice_stop") : advT(lang, "as_voice")}
          </button>
          <button type="button" className="cp-btn-sm" onClick={fillAddressFromPin} disabled={geoBusy}>
            {geoBusy ? advT(lang, "as_geo_busy") : advT(lang, "as_geo")}
          </button>
          <button type="button" className="cp-btn-sm" onClick={saveDraftOffline}>
            {advT(lang, "as_draft_save")}
          </button>
          {queueCount > 0 && (
            <button type="button" className="cp-btn-sm active" onClick={loadLatestDraft}>
              {advT(lang, "as_draft_load")} ({queueCount})
            </button>
          )}
        </div>
      </div>

      {aiNote && <small style={{ color: "var(--g2)", display: "block" }}>{aiNote}</small>}
      {voiceErr && <small style={{ color: "var(--cp-red)", display: "block" }}>{advT(lang, "as_voice_no")}</small>}
      {draftMsg && <small style={{ color: "var(--g2)", display: "block" }}>{draftMsg}</small>}
      {!offline && queueCount > 0 && (
        <small style={{ color: "var(--cp-amb)", display: "block", marginTop: 4 }}>
          {queueCount} {advT(lang, "as_queue_ready")}
        </small>
      )}
      {offline && <div className="cp-offline-bar">{advT(lang, "as_offline")}</div>}

      {dup && (
        <div className="cp-dup-warn">
          <div>
            <b>{advT(lang, "as_dup_title")}</b>
            <div style={{ fontSize: 14 }}>
              #CP-{dup.seq} · {dup.title} ({dup.upvoteCount})
            </div>
          </div>
          <Link href={`/issues/${dup.id}`} className="cp-btn-sm active">
            {advT(lang, "as_dup_cta")} →
          </Link>
        </div>
      )}
    </div>
  );
}
