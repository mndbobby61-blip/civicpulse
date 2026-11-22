"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./lang-provider";
import { Icon } from "./icon";
import type { Key } from "@/lib/dict";

type V = React.CSSProperties;

/* ---------- ছোট সহায়ক ---------- */
function tilt(e: React.PointerEvent<HTMLElement>) {
  const c = e.currentTarget;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", `${e.clientX - r.left}px`);
  c.style.setProperty("--my", `${e.clientY - r.top}px`);
  c.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
  c.style.setProperty("--rx", `${(0.5 - (e.clientY - r.top) / r.height) * 8}deg`);
}
function untilt(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

function Ico({ name, lg }: { name: string; lg?: boolean }) {
  return (
    <i className={`cp-ico ${lg ? "lg" : ""}`}>
      <Icon name={name} />
    </i>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`cp-rv ${className}`}>
      {children}
    </div>
  );
}

function Counter({ to }: { to: number }) {
  const { lang } = useLang();
  const [v, setV] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1500, 1);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <b ref={ref}>{v.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</b>;
}

function Head({ e, t, l }: { e: Key; t: Key; l: Key }) {
  const { t: tr } = useLang();
  return (
    <>
      <div className="cp-eyebrow">{tr(e)}</div>
      <h2 className="cp-h2">{tr(t)}</h2>
      <p className="cp-lead">{tr(l)}</p>
    </>
  );
}

/* ---------- টিকার ---------- */
export function Ticker() {
  const { t } = useLang();
  const keys: Key[] = ["tk1", "tk2", "tk3", "tk4", "tk5"];
  const items = [...keys, ...keys];
  return (
    <div className="cp-ticker" aria-hidden="true">
      <div>
        {items.map((k, i) => (
          <span key={i}><b>●</b> {t(k)}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Stats ---------- */
export function Stats() {
  const { t } = useLang();
  const list: { icon: string; to: number; k: Key }[] = [
    { icon: "file", to: 12480, k: "st1" },
    { icon: "check", to: 9732, k: "st2" },
    { icon: "clock", to: 38, k: "st3" },
    { icon: "smile", to: 94, k: "st4" },
  ];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="st_eyebrow" t="st_title" l="st_lead" />
        <div className="cp-stats">
          {list.map((s) => (
            <div className="cp-stat" key={s.k}>
              <Ico name={s.icon} />
              <Counter to={s.to} />
              <span>{t(s.k)}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- How it works ---------- */
export function How() {
  const { t } = useLang();
  const steps: { n: string; icon: string; tt: Key; d: Key }[] = [
    { n: "01", icon: "cam", tt: "s1t", d: "s1d" },
    { n: "02", icon: "shield", tt: "s2t", d: "s2d" },
    { n: "03", icon: "wrench", tt: "s3t", d: "s3d" },
    { n: "04", icon: "check", tt: "s4t", d: "s4d" },
  ];
  return (
    <section className="cp-sec" id="how">
      <Reveal className="cp-wrap">
        <Head e="how_eyebrow" t="how_title" l="how_lead" />
        <div className="cp-steps">
          {steps.map((s) => (
            <div className="cp-step" key={s.n}>
              <Ico name={s.icon} />
              <div className="n">{s.n}</div>
              <h3>{t(s.tt)}</h3>
              <p>{t(s.d)}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Categories ---------- */
export function Categories() {
  const { t } = useLang();
  const cats: { c: string; icon: string; tt: Key; d: Key }[] = [
    { c: "cp-b1", icon: "road", tt: "c1t", d: "c1d" },
    { c: "cp-b2", icon: "bulb", tt: "c2t", d: "c2d" },
    { c: "cp-b3", icon: "drop", tt: "c3t", d: "c3d" },
    { c: "cp-b4", icon: "walk", tt: "c4t", d: "c4d" },
    { c: "cp-b5", icon: "trash", tt: "c5t", d: "c5d" },
    { c: "cp-b6", icon: "build", tt: "c6t", d: "c6d" },
  ];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="cat_eyebrow" t="cat_title" l="cat_lead" />
        <div className="cp-bento">
          {cats.map((c) => (
            <div key={c.c} className={`cp-card ${c.c}`} onPointerMove={tilt} onPointerLeave={untilt}>
              <Ico name={c.icon} lg />
              <div>
                <h3>{t(c.tt)}</h3>
                <p>{t(c.d)}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Live map ---------- */
export function LiveMap() {
  const { t } = useLang();
  const items: { col: string; tt: Key; s: Key }[] = [
    { col: "var(--cp-red)", tt: "m1t", s: "m1s" },
    { col: "var(--cp-amb)", tt: "m2t", s: "m2s" },
    { col: "var(--g2)", tt: "m3t", s: "m3s" },
    { col: "var(--cp-amb)", tt: "m4t", s: "m4s" },
  ];
  const pins: [number, number, string, number][] = [
    [260, 190, "var(--cp-red)", 0],
    [600, 295, "var(--cp-amb)", 1],
    [400, 410, "var(--g1)", 2],
    [740, 190, "var(--cp-red)", 1.5],
    [120, 420, "var(--cp-amb)", 0.6],
  ];
  return (
    <section className="cp-sec" id="map">
      <Reveal className="cp-wrap">
        <Head e="map_eyebrow" t="map_title" l="map_lead" />
        <div className="cp-live">
          <div className="cp-mapbox" aria-hidden="true">
            <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
              <use href="#city" />
              {pins.map(([x, y, c, d]) => (
                <circle key={`${x}-${y}`} className="cp-pin" cx={x} cy={y} r="4" style={{ fill: c, animationDelay: `${d}s` }} />
              ))}
            </svg>
          </div>
          <div className="cp-list">
            {items.map((it) => (
              <div className="cp-card cp-item" key={it.tt} onPointerMove={tilt} onPointerLeave={untilt}>
                <span className="dot" style={{ background: it.col }} />
                <div>
                  <b>{t(it.tt)}</b>
                  <small>{t(it.s)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Before / After ---------- */
export function BeforeAfter() {
  const { t } = useLang();
  const [p, setP] = useState(50);
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="ba_eyebrow" t="ba_title" l="ba_lead" />
        <div className="cp-ba" style={{ "--p": `${p}%` } as V}>
          <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="800" height="460" fill="#2b3440" />
            <rect y="215" width="800" height="12" fill="#3a4654" />
            <g fill="#e8d36a">
              {[40, 200, 360, 520, 680].map((x) => (<rect key={x} x={x} y="228" width="90" height="8" />))}
            </g>
            <rect width="800" height="70" fill="#9fb6c8" />
          </svg>
          <svg className="before" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="800" height="460" fill="#252b33" />
            <g fill="#e8d36a" opacity=".7"><rect x="40" y="228" width="90" height="8" /><rect x="520" y="228" width="90" height="8" /></g>
            <ellipse cx="330" cy="290" rx="120" ry="52" fill="#0f1318" />
            <ellipse cx="330" cy="285" rx="100" ry="38" fill="#05070a" />
            <path d="M200 250l-50-30M450 320l60 30M300 350l-20 50M420 260l70-24" stroke="#0f1318" strokeWidth="4" fill="none" />
            <rect width="800" height="70" fill="#7f8c97" />
          </svg>
          <span className="tag" style={{ left: 18 }}>{t("ba_before")}</span>
          <span className="tag" style={{ right: 18 }}>{t("ba_after")}</span>
          <div className="bar" />
          <input type="range" min={0} max={100} value={p} aria-label={t("ba_label")} onChange={(e) => setP(Number(e.target.value))} />
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Leaderboard ---------- */
export function Leaderboard() {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const rows: { icon: string; k: Key; v: number }[] = [
    { icon: "road", k: "d1", v: 96 },
    { icon: "bulb", k: "d2", v: 91 },
    { icon: "drop", k: "d3", v: 84 },
    { icon: "trash", k: "d4", v: 78 },
  ];
  return (
    <section className="cp-sec" id="rank">
      <Reveal className="cp-wrap">
        <Head e="rk_eyebrow" t="rk_title" l="rk_lead" />
        <div className="cp-lb">
          {rows.map((r, i) => (
            <div className="cp-card cp-lbrow" key={r.k}>
              <span className="r">{(i + 1).toLocaleString(loc)}</span>
              <b className="cp-dn"><Icon name={r.icon} />{t(r.k)}</b>
              <div className="cp-track"><i style={{ "--w": `${r.v}%` } as V} /></div>
              <b>{r.v.toLocaleString(loc)}%</b>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- FAQ + CTA ---------- */
export function Faq() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  const qa: { q: Key; a: Key }[] = [
    { q: "q1", a: "a1" },
    { q: "q2", a: "a2" },
    { q: "q3", a: "a3" },
    { q: "q4", a: "a4" },
  ];
  return (
    <section className="cp-sec" id="faq">
      <Reveal className="cp-wrap">
        <Head e="fq_eyebrow" t="fq_title" l="fq_lead" />
        {qa.map((x, i) => (
          <div key={x.q} className={`cp-faqi ${open === i ? "open" : ""}`}>
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              {t(x.q)}
              <span className="pl">+</span>
            </button>
            <div className="cp-ans"><div><p>{t(x.a)}</p></div></div>
          </div>
        ))}
        <div className="cp-cta">
          <h2 className="cp-h2">{t("cta_title")}</h2>
          <p>{t("cta_text")}</p>
          <div className="cp-row">
            <button className="cp-btn">{t("btn_report")}</button>
            <button className="cp-btn ghost">{t("cta_b2")}</button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const { t } = useLang();
  return <footer className="cp-foot">{t("foot")}</footer>;
}