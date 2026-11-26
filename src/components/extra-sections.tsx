"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import { Icon } from "./icon";
import ReportLink from "./report-link";
import { Reveal, Head, Ico, Counter, tilt, untilt } from "./sections";
import type { Key } from "@/lib/dict";

type V = React.CSSProperties;

/* ---------- আসল ডেটার স্ট্যাটস ---------- */
type Stats = { total: number; resolved: number; hours: number; satisfied: number };

export function LiveStats() {
  const { t } = useLang();
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: Stats) => live && setS(d))
      .catch(() => live && setS({ total: 0, resolved: 0, hours: 0, satisfied: 0 }));
    return () => { live = false; };
  }, []);

  const list: { icon: string; v: number; k: Key }[] = s
    ? [
        { icon: "file", v: s.total, k: "st1" },
        { icon: "check", v: s.resolved, k: "st2" },
        { icon: "clock", v: s.hours, k: "st3" },
        { icon: "smile", v: s.satisfied, k: "st4" },
      ]
    : [];
  const placeholders: [string, Key][] = [["file", "st1"], ["check", "st2"], ["clock", "st3"], ["smile", "st4"]];

  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="st_eyebrow" t="st_title" l="st_lead" />
        <div className="cp-stats">
          {s
            ? list.map((x) => (
                <div className="cp-stat" key={x.k}>
                  <Ico name={x.icon} />
                  <Counter to={x.v} />
                  <span>{t(x.k)}</span>
                </div>
              ))
            : placeholders.map(([icon, k]) => (
                <div className="cp-stat" key={k}>
                  <Ico name={icon} />
                  <b>–</b>
                  <span>{t(k)}</span>
                </div>
              ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- ফিচার ---------- */
export function Features() {
  const { t } = useLang();
  const F: { icon: string; tt: Key; d: Key }[] = [
    { icon: "copy", tt: "fe1t", d: "fe1d" },
    { icon: "clock", tt: "fe2t", d: "fe2d" },
    { icon: "bell", tt: "fe3t", d: "fe3d" },
    { icon: "lock", tt: "fe4t", d: "fe4d" },
    { icon: "chart", tt: "fe5t", d: "fe5d" },
    { icon: "globe", tt: "fe6t", d: "fe6d" },
  ];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="fe_eyebrow" t="fe_title" l="fe_lead" />
        <div className="cp-feat">
          {F.map((f) => (
            <div className="cp-card" key={f.tt} onPointerMove={tilt} onPointerLeave={untilt}>
              <Ico name={f.icon} lg />
              <h3>{t(f.tt)}</h3>
              <p>{t(f.d)}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- বিভাগের জন্য ---------- */
export function ForDepts() {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const items: Key[] = ["fd1", "fd2", "fd3", "fd4"];
  const bars: [Key, number][] = [["f_done", 78], ["f_prog", 54], ["f_new", 31]];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <div className="cp-fd">
          <div>
            <Head e="fd_eyebrow" t="fd_title" l="fd_lead" />
            <ul className="cp-fdl">
              {items.map((k) => (
                <li key={k}>
                  <span className="tick"><Icon name="check" /></span>
                  {t(k)}
                </li>
              ))}
            </ul>
            <Link href="/login" className="cp-btn">{t("fd_btn")}</Link>
          </div>
          <div className="cp-mock" aria-hidden="true">
            <div className="top">
              <b>{t("d1")}</b>
              <span className="cp-chip" style={{ color: "var(--g2)" }}>{t("fd_sla")}</span>
            </div>
            <div className="body">
              <div className="cp-ring" style={{ "--pct": "92%" } as V}><b>{(92).toLocaleString(loc)}%</b></div>
              <div className="bars">
                {bars.map(([k, v]) => (
                  <div key={k}>
                    <span>{t(k)}<b>{v.toLocaleString(loc)}%</b></span>
                    <i style={{ "--w": `${v}%` } as V} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- মানুষের কথা ---------- */
export function Testimonials() {
  const { t } = useLang();
  const T: { q: Key; n: Key; r: Key }[] = [
    { q: "ts1q", n: "ts1n", r: "ts1r" },
    { q: "ts2q", n: "ts2n", r: "ts2r" },
    { q: "ts3q", n: "ts3n", r: "ts3r" },
  ];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="ts_eyebrow" t="ts_title" l="ts_lead" />
        <div className="cp-tst">
          {T.map((x) => (
            <div className="cp-card" key={x.q} onPointerMove={tilt} onPointerLeave={untilt}>
              <span className="cp-stars" aria-hidden="true">★★★★★</span>
              <q>{t(x.q)}</q>
              <div className="who">
                <span className="av">{t(x.n).charAt(0)}</span>
                <div><b>{t(x.n)}</b><small>{t(x.r)}</small></div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- ফুটার ---------- */
export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="cp-footer">
      <div className="cp-wrap">
        <div className="cp-fgrid">
          <div>
            <div className="cp-logo">
              <svg viewBox="0 0 34 18" aria-hidden="true">
                <path d="M0 9h9l3-7 5 14 4-10 2 3h11" fill="none" stroke="var(--g2)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              CivicPulse
            </div>
            <p>{t("fo_tag")}</p>
            <LangToggle />
          </div>
          <div>
            <h4>{t("fo_c1")}</h4>
            <ul>
              <li><Link href="/#how">{t("nav_how")}</Link></li>
              <li><Link href="/map">{t("nav_map")}</Link></li>
              <li><Link href="/#rank">{t("nav_rank")}</Link></li>
              <li><Link href="/#faq">{t("nav_faq")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t("fo_c2")}</h4>
            <ul>
              <li><Link href="/login">{t("auth_login")}</Link></li>
              <li><Link href="/register">{t("auth_register")}</Link></li>
              <li><ReportLink>{t("nav_cta")}</ReportLink></li>
            </ul>
          </div>
          <div className="cp-fcontact">
            <h4>{t("fo_c3")}</h4>
            <ul>
              <li><Icon name="mail" /> support@civicpulse.example</li>
              <li><Icon name="pin" /> {t("fo_addr")}</li>
            </ul>
          </div>
        </div>
        <div className="cp-fbot">
          <span>© 2026 CivicPulse · {t("fo_rights")}</span>
          <span>{t("fo_made")}</span>
        </div>
      </div>
    </footer>
  );
}