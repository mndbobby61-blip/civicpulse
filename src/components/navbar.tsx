"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import { Icon } from "./icon";
import type { Key } from "@/lib/dict";

const links: { id: string; key: Key; icon: string }[] = [
  { id: "how", key: "nav_how", icon: "wrench" },
  { id: "map", key: "nav_map", icon: "road" },
  { id: "rank", key: "nav_rank", icon: "check" },
  { id: "faq", key: "nav_faq", icon: "file" },
];

export default function Navbar() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const ref = useRef<HTMLElement>(null);

  // স্ক্রল করলে কোন সেকশনে আছেন সেটা ধরে
  useEffect(() => {
    const els = links
      .map((l) => document.getElementById(l.id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // বাইরে চাপলে, Esc চাপলে বা স্ক্রিন বড় হলে মেনু বন্ধ
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth > 860 && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <nav className="cp-nav" ref={ref}>
      <a href="#" className="cp-logo">
        <svg viewBox="0 0 34 18" aria-hidden="true">
          <path d="M0 9h9l3-7 5 14 4-10 2 3h11" fill="none" stroke="var(--g2)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        CivicPulse
      </a>

      {/* ডেস্কটপ */}
      <div className="cp-desk">
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} className={active === l.id ? "active" : ""}>
            {t(l.key)}
          </a>
        ))}
      </div>
      <div className="cp-actions">
        <LangToggle />
        <button className="cp-btn" style={{ padding: "10px 22px" }}>{t("nav_cta")}</button>
      </div>

      {/* মোবাইল: তিন-ডট বাটন */}
      <button
        className={`cp-burger ${open ? "open" : ""}`}
        aria-label={t("nav_menu")}
        aria-expanded={open}
        aria-controls="cp-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="dots">
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        )}
      </button>

      {/* মোবাইল মেনু */}
      {open && (
        <div className="cp-panel" id="cp-panel">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <span className="ti"><Icon name={l.icon} /></span>
              {t(l.key)}
            </a>
          ))}
          <div className="cp-panel-bottom">
            <LangToggle />
            <button className="cp-btn" onClick={() => setOpen(false)}>{t("nav_cta")}</button>
          </div>
        </div>
      )}
    </nav>
  );
}