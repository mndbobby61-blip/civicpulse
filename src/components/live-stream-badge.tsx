"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "./lang-provider";
import { useMe } from "./me-provider";
import { advT } from "@/lib/advanced-dict";

export default function LiveStreamBadge() {
  const { lang } = useLang();
  const { me } = useMe();
  const router = useRouter();
  const [liveUnread, setLiveUnread] = useState<number | null>(null);
  const [pushPerm, setPushPerm] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission;
  });

  useEffect(() => {
    if (!me) return;
    let first = true;
    const es = new EventSource("/api/notifications/stream");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { unread?: number };
        if (typeof data.unread === "number") {
          setLiveUnread((prev) => {
            if (!first && prev !== null && data.unread! > prev) {
              router.refresh();
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("CivicPulse", {
                  body:
                    lang === "bn"
                      ? `আপনার ${data.unread}টি অপঠিত নোটিফিকেশন আছে`
                      : `You have ${data.unread} unread notification(s)`,
                  icon: "/globe.svg",
                });
              }
            }
            first = false;
            return data.unread!;
          });
        }
      } catch {
        // Ignore malformed SSE payload
      }
    };

    return () => {
      es.close();
    };
  }, [me, router, lang]);

  async function enableDesktopAlerts() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setPushPerm(perm);
  }

  if (!me) return null;

  return (
    <div className="cp-row" style={{ gap: 6, alignItems: "center", flexWrap: "nowrap" }}>
      <span className="cp-live-pill" title={advT(lang, "live_badge")}>
        <span className="cp-live-dot" />
        <span>{advT(lang, "live_badge")}</span>
        {liveUnread !== null && liveUnread > 0 ? <b>({liveUnread})</b> : null}
      </span>
      {pushPerm === "default" && (
        <button type="button" className="cp-btn-sm" onClick={enableDesktopAlerts}>
          {advT(lang, "push_enable")}
        </button>
      )}
    </div>
  );
}
