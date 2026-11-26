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

export function MeProvider({ children }: { children: React.ReactNode }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const [me, setMe] = useState<Me>(null);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<NItem[]>([]);
  const [toast, setToast] = useState<NItem[] | null>(null);
  const seen = useRef(new Set<string>());
  const unread = items.filter((i) => !i.isRead).length;

  // কে লগইন করা আছে
  useEffect(() => {
    let live = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (live) { setMe(d.user); setReady(true); } })
      .catch(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);

  // নোটিফিকেশন আনা। যেগুলো আগে দেখানো হয়নি সেগুলোই শুধু ওপরের বার্তায় আসে
  const poll = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications", { cache: "no-store" });
      if (!r.ok) return;
      const d = (await r.json()) as { items: NItem[] };
      setItems(d.items);
      const fresh = d.items.filter((i) => !i.isRead && !seen.current.has(i.id));
      if (fresh.length) {
        fresh.forEach((f) => seen.current.add(f.id));
        setToast(fresh);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!me) return;
    poll();
    const h = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, 30000);
    return () => clearInterval(h);
  }, [me, poll]);

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