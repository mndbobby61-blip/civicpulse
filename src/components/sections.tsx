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

/* ================= 3D LIVE MAP ================= */
type St = "new" | "prog" | "done";
type Issue = { id: number; x: number; y: number; st: St; icon: string; tt: Key; s: Key };
type Flt = "all" | St;

const ISSUES: Issue[] = [
  { id: 1, x: 260, y: 190, st: "new", icon: "road", tt: "m1t", s: "m1s" },
  { id: 2, x: 600, y: 295, st: "prog", icon: "bulb", tt: "m2t", s: "m2s" },
  { id: 3, x: 400, y: 410, st: "done", icon: "drop", tt: "m3t", s: "m3s" },
  { id: 4, x: 740, y: 190, st: "prog", icon: "walk", tt: "m4t", s: "m4s" },
  { id: 5, x: 120, y: 420, st: "new", icon: "trash", tt: "m5t", s: "m5s" },
  { id: 6, x: 880, y: 360, st: "done", icon: "road", tt: "m6t", s: "m6s" },
];
const ST: Record<St, { c: string; k: Key }> = {
  new: { c: "var(--cp-red)", k: "f_new" },
  prog: { c: "var(--cp-amb)", k: "f_prog" },
  done: { c: "var(--g2)", k: "f_done" },
};
// [x, y, প্রস্থ, গভীরতা, উচ্চতা]
const BLDG: [number, number, number, number, number][] = [
  [140, 100, 100, 80, 46], [280, 108, 100, 70, 72], [540, 104, 90, 72, 96],
  [760, 108, 100, 70, 58], [145, 205, 90, 70, 36], [415, 205, 100, 70, 50],
  [760, 205, 90, 80, 40], [150, 430, 90, 80, 52], [420, 440, 100, 80, 84],
  [900, 430, 80, 90, 40],
];

export function LiveMap() {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const [f, setF] = useState<Flt>("all");
  const [sel, setSel] = useState(1);
  const stage = useRef<HTMLDivElement>(null);

  const shown = ISSUES.filter((i) => f === "all" || i.st === f);
  const cur = shown.find((i) => i.id === sel) ?? shown[0];
  const filters: [Flt, Key][] = [["all", "f_all"], ["new", "f_new"], ["prog", "f_prog"], ["done", "f_done"]];
  const count = (k: Flt) => ISSUES.filter((i) => k === "all" || i.st === k).length.toLocaleString(loc);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--a", String(58 - dy * 10));
    el.style.setProperty("--b", String(-28 + dx * 16));
  }
  function leave() {
    stage.current?.style.setProperty("--a", "58");
    stage.current?.style.setProperty("--b", "-28");
  }

  return (
    <section className="cp-sec" id="map">
      <Reveal className="cp-wrap">
        <Head e="map_eyebrow" t="map_title" l="map_lead" />
        <div className="cp-mx">
          <div className="cp-stage3d" ref={stage} onPointerMove={move} onPointerLeave={leave}>
            <div className="cp-chips">
              {filters.map(([k, label]) => (
                <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>
                  {t(label)} <b>{count(k)}</b>
                </button>
              ))}
            </div>
            <div className="cp-hint">{t("map_hint")}</div>

            <div className="cp-plane">
              <svg viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
                <use href="#city" />
              </svg>
              {BLDG.map(([x, y, w, d, h], i) => (
                <div key={i} className="bx3" style={{ left: x, top: y, width: w, height: d, "--h": `${h}px` } as V}>
                  <i className="t" /><i className="s" /><i className="e" />
                </div>
              ))}
              {shown.map((i) => (
                <div key={i.id} className={`pn3 ${cur?.id === i.id ? "on" : ""}`} style={{ left: i.x, top: i.y, "--pc": ST[i.st].c } as V}>
                  <span className="ring" />
                  <div className="up">
                    <button className="head" onClick={() => setSel(i.id)} aria-label={t(i.tt)}>
                      <Icon name={i.icon} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cur && (
              <div className="cp-pop" key={cur.id} style={{ "--pc": ST[cur.st].c } as V}>
                <Ico name={cur.icon} />
                <div className="tx">
                  <b>{t(cur.tt)}</b>
                  <small>{t(cur.s)}</small>
                </div>
                <span className="cp-st">{t(ST[cur.st].k)}</span>
                <button className="cp-btn">{t("pop_btn")}</button>
              </div>
            )}
          </div>

          <div className="cp-rows">
            {shown.map((i) => (
              <button
                key={i.id}
                className={`cp-card cp-row3 ${cur?.id === i.id ? "on" : ""}`}
                style={{ "--pc": ST[i.st].c } as V}
                onClick={() => setSel(i.id)}
                onPointerMove={tilt}
                onPointerLeave={untilt}
              >
                <Ico name={i.icon} />
                <div className="tx">
                  <b>{t(i.tt)}</b>
                  <small>{t(i.s)}</small>
                </div>
                <span className="cp-st">{t(ST[i.st].k)}</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ================= 3D BEFORE / AFTER ================= */
function Road({ after }: { after?: boolean }) {
  const s = after ? "a" : "b";
  const dashes: [number, number][] = [[160, 167], [178, 189], [204, 222], [250, 278], [318, 360], [410, 470]];
  const hw = (y: number) => 1.2 + (y - 150) * 0.03;
  const towers: [number, number, number][] = [[30, 100, 46], [90, 84, 38], [150, 108, 52], [230, 92, 40], [560, 96, 44], [620, 78, 36], [690, 104, 56], [770, 90, 40]];
  return (
    <>
      <defs>
        <linearGradient id={`sky${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f9bd1" /><stop offset="1" stopColor="#e4eef6" />
        </linearGradient>
        <linearGradient id={`rd${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={after ? "#444c55" : "#4d555f"} />
          <stop offset="1" stopColor={after ? "#1d2228" : "#22282f"} />
        </linearGradient>
        <radialGradient id={`ph${s}`} cx=".5" cy=".45" r=".6">
          <stop offset="0" stopColor="#020304" /><stop offset=".7" stopColor="#13171c" /><stop offset="1" stopColor="#2c333b" />
        </radialGradient>
        <linearGradient id={`pd${s}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9fc3e0" stopOpacity=".7" /><stop offset="1" stopColor="#5f87a6" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id={`vg${s}`} cx=".5" cy=".5" r=".75">
          <stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" />
        </radialGradient>
        <filter id={`gr${s}`}>
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <clipPath id={`cl${s}`}><polygon points="330,150 470,150 900,460 -100,460" /></clipPath>
      </defs>

      <rect width="800" height="150" fill={`url(#sky${s})`} />
      <circle cx="640" cy="70" r="60" fill="#fff" opacity=".35" />
      <g fill="#8aa3b8" opacity=".75">
        {towers.map(([x, y, w]) => (<rect key={x} x={x} y={y} width={w} height={150 - y} />))}
      </g>
      <rect y="150" width="800" height="310" fill="#aab4b9" />
      <polygon points="330,150 470,150 900,460 -100,460" fill={`url(#rd${s})`} />
      <rect x="-100" y="150" width="1000" height="310" filter={`url(#gr${s})`} opacity=".16" clipPath={`url(#cl${s})`} />
      <path d="M332 150L-100 460M468 150L900 460" stroke="#dfe5e8" strokeWidth="4" opacity=".85" />
      <path d="M340 150L-40 460M460 150L840 460" stroke="#f1f4f5" strokeWidth="2" opacity=".55" />
      <g fill="#f2d96a">
        {dashes.map(([y1, y2]) => (
          <polygon key={y1} points={`${400 - hw(y1)},${y1} ${400 + hw(y1)},${y1} ${400 + hw(y2)},${y2} ${400 - hw(y2)},${y2}`} />
        ))}
      </g>

      {!after ? (
        <g>
          <ellipse cx="560" cy="352" rx="142" ry="44" fill="#1b2026" opacity=".6" stroke="#5b646e" strokeWidth="2" />
          <ellipse cx="560" cy="352" rx="122" ry="35" fill={`url(#ph${s})`} />
          <ellipse cx="560" cy="356" rx="96" ry="24" fill="#000" opacity=".55" />
          <ellipse cx="575" cy="360" rx="70" ry="12" fill={`url(#pd${s})`} />
          <ellipse cx="548" cy="346" rx="30" ry="3" fill="#fff" opacity=".35" />
          <path d="M440 340l-52-16-24-22M470 322l-26-32M520 312l-10-34M620 316l30-30M680 340l52-14M690 366l54 18M520 394l-14 30M610 396l18 28" stroke="#0f1318" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <g fill="#6b747d">
            {[[430, 372], [452, 384], [684, 372], [706, 358], [492, 404], [640, 408]].map(([x, y]) => (<circle key={`${x}${y}`} cx={x} cy={y} r="3" />))}
          </g>
          {[[400, 372, 1], [716, 392, 1.25]].map(([x, y, k]) => (
            <g key={x} transform={`translate(${x} ${y}) scale(${k})`}>
              <ellipse cx="0" cy="4" rx="16" ry="4" fill="#000" opacity=".4" />
              <rect x="-14" y="-2" width="28" height="6" rx="2" fill="#1c2127" />
              <polygon points="-9,-2 9,-2 4,-36 -4,-36" fill="#ff7a1a" />
              <polygon points="-6.5,-14 6.5,-14 5.3,-21 -5.3,-21" fill="#fff" />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <ellipse cx="560" cy="352" rx="130" ry="38" fill="#262c33" stroke="#3b434b" strokeWidth="2.5" />
          <ellipse cx="560" cy="350" rx="118" ry="32" fill="#20262c" />
          <ellipse cx="540" cy="344" rx="84" ry="9" fill="#fff" opacity=".1" />
          <path d="M432 352c20-26 64-38 128-38" stroke="#0e1216" strokeWidth="1.5" fill="none" opacity=".6" />
        </g>
      )}
      <rect width="800" height="460" fill={`url(#vg${s})`} />
    </>
  );
}

export function BeforeAfter() {
  const { t } = useLang();
  const [p, setP] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tx", String(-dy * 6));
    el.style.setProperty("--ty", String(dx * 8));
  }
  function leave() {
    ref.current?.style.setProperty("--tx", "0");
    ref.current?.style.setProperty("--ty", "0");
  }

  const meta: { icon: string; l: Key; v: Key }[] = [
    { icon: "file", l: "ba_m1", v: "ba_m1v" },
    { icon: "clock", l: "ba_m2", v: "ba_m2v" },
    { icon: "wrench", l: "ba_m3", v: "ba_m3v" },
    { icon: "smile", l: "ba_m4", v: "ba_m4v" },
  ];

  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="ba_eyebrow" t="ba_title" l="ba_lead" />
        <div className="cp-bx3" onPointerMove={move} onPointerLeave={leave}>
          <div className="cp-bf" ref={ref} style={{ "--p": `${p}%` } as V}>
            <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <Road after />
            </svg>
            <svg className="before" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <Road />
            </svg>
            <span className="tag" style={{ left: 18 }}><i style={{ background: "var(--cp-red)" }} />{t("ba_before")}</span>
            <span className="tag" style={{ right: 18 }}><i style={{ background: "var(--g2)" }} />{t("ba_after")}</span>
            <span className="loc"><Icon name="road" />{t("ba_loc")}</span>
            <div className="bar"><span className="knob">‹ ›</span></div>
            <input type="range" min={0} max={100} value={p} aria-label={t("ba_label")} onChange={(e) => setP(Number(e.target.value))} />
          </div>
        </div>
        <div className="cp-meta">
          {meta.map((m) => (
            <div className="cp-card" key={m.l} onPointerMove={tilt} onPointerLeave={untilt}>
              <Ico name={m.icon} />
              <small>{t(m.l)}</small>
              <b>{t(m.v)}</b>
            </div>
          ))}
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