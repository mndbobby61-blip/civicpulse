"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { Icon } from "./icon";
import { notifText } from "@/lib/notif-text";

export type Me = { name: string; role: "ADMIN" | "MANAGER" | "STAFF" | "CITIZEN" } | null;
export type NItem = { id: string; type: string; message: string; issueId: string | null; isRead: boolean; at: string };

type Ctx = { me: Me; ready: boolean; items: NItem[]; unread: number; markRead: (ids?: string[]) => Promise<void> };

const C = createContext<Ctx>({ me: null, ready: false, items: [], unread: 0, markRead: async () => {} });
export const useMe = () => useContext(C);

/** Subtle audio ping for new notifications — no external file needed */
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => ctx.close();
  } catch {
    // Audio not available — silently skip
  }
}

export function MeProvider({ children }: { children: React.ReactNode }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const [me, setMe] = useState<Me>(null);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<NItem[]>([]);
  const [toast, setToast] = useState<NItem[] | null>(null);
  const seen = useRef(new Set<string>());
  const unread = items.filter((i) => !i.isRead).length;

  // ব্রাউজার ট্যাবের টাইটেলে unread count দেখানো
  useEffect(() => {
    const base = "CivicPulse";
    if (typeof document === "undefined") return;
    document.title = unread > 0 ? `(${unread > 99 ? "99+" : unread}) ${base}` : base;
  }, [unread]);

  // কে লগইন করা আছে
  useEffect(() => {
    let live = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (live) { setMe(d.user); setReady(true); } })
      .catch(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);

  // নোটিফিকেশন fetch করা (SSE event এলে বা fallback poll-এ)
  const fetchNotifs = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications", { cache: "no-store" });
      if (!r.ok) return;
      const d = (await r.json()) as { items: NItem[] };
      setItems(d.items);
      const fresh = d.items.filter((i) => !i.isRead && !seen.current.has(i.id));
      if (fresh.length) {
        fresh.forEach((f) => seen.current.add(f.id));
        setToast(fresh);
        // নতুন notification এলে audio beep
        playNotifSound();
      }
    } catch {}
  }, []);

  // SSE stream দিয়ে real-time sync। disconnect হলে exponential backoff reconnect
  useEffect(() => {
    if (!me) return;
    fetchNotifs(); // initial load

    let es: EventSource | null = null;
    let retryMs = 3000;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let alive = true;

    function connect() {
      if (!alive) return;
      es = new EventSource("/api/notifications/stream");

      es.onmessage = () => {
        // SSE event এলে full notification list refresh করো
        if (document.visibilityState === "visible") fetchNotifs();
        retryMs = 3000; // success — reset backoff
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!alive) return;
        // Exponential backoff: 3s → 6s → 12s → max 60s
        retryTimer = setTimeout(() => {
          retryMs = Math.min(retryMs * 2, 60_000);
          connect();
        }, retryMs);
      };
    }

    connect();

    // Fallback: যদি SSE সম্পূর্ণ কাজ না করে (যেমন Vercel free tier), 60s poll চালু
    fallbackInterval = setInterval(() => {
      if (document.visibilityState === "visible" && !es) fetchNotifs();
    }, 60_000);

    // Tab visible হলে refresh করো
    function onVisible() {
      if (document.visibilityState === "visible") fetchNotifs();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
      if (fallbackInterval) clearInterval(fallbackInterval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [me, fetchNotifs]);

  const markRead = useCallback(async (ids?: string[]) => {
    setItems((p) => p.map((i) => (!ids || ids.includes(i.id) ? { ...i, isRead: true } : i)));
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } catch {}
  }, []);

  // বার্তা ৮ সেকেন্ড পর নিজে বন্ধ হয়, আর তখনই "পড়া হয়েছে" হয়ে যায়
  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => {
      markRead(toast.map((i) => i.id));
      setToast(null);
    }, 8000);
    return () => clearTimeout(h);
  }, [toast, markRead]);

  function dismiss() {
    if (!toast) return;
    markRead(toast.map((i) => i.id));
    setToast(null);
  }

  return (
    <C.Provider value={{ me, ready, items, unread, markRead }}>
      {children}
      {toast && (
        <div className="cp-toast" role="status" aria-live="polite">
          <i className="cp-ico"><Icon name="bell" /></i>
          <div className="tx">
            <b>{toast.length > 1 ? `${toast.length.toLocaleString(loc)} ${t("toast_n")}` : t("toast_new")}</b>
            <small>{notifText(toast[0], t)}</small>
          </div>
          <Link href={toast[0].issueId ? `/issues/${toast[0].issueId}` : "/notifications"} onClick={dismiss}>
            {t("toast_view")}
          </Link>
          <button type="button" aria-label="close" onClick={dismiss}>×</button>
        </div>
      )}
    </C.Provider>
  );
}