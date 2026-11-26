"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import { Icon } from "./icon";
import ReportLink from "./report-link";
import { Reveal, Head, Ico, Counter, tilt, untilt } from "./sections";
import type { Key } from "@/lib/dict";
import { STATUS_COLOR } from "@/lib/ui";

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

/* ---------- আগে বনাম এখন ---------- */
export function Compare() {
  const { t } = useLang();
  const olds: Key[] = ["old1", "old2", "old3", "old4"];
  const news: Key[] = ["new1", "new2", "new3", "new4"];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="cm_eyebrow" t="cm_title" l="cm_lead" />
        <div className="cp-cmp">
          <div className="cp-card old">
            <h3>{t("cm_old")}</h3>
            <ul>
              {olds.map((k) => (<li key={k}><span className="x">×</span>{t(k)}</li>))}
            </ul>
          </div>
          <div className="cp-card new">
            <h3>{t("cm_new")}</h3>
            <ul>
              {news.map((k) => (<li key={k}><span className="ok"><Icon name="check" /></span>{t(k)}</li>))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- রিপোর্ট ট্র্যাক ---------- */
type Tr = {
  found: boolean; title?: string; status?: string; cat?: string; catBn?: string | null;
  area?: string | null; history?: { to: string; at: string }[];
};

export function Track() {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const [code, setCode] = useState("");
  const [res, setRes] = useState<Tr | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    // বাংলা সংখ্যা লিখলেও কাজ করে
    const n = code.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\D/g, "");
    if (!n) return;
    setBusy(true);
    setErr(false);
    try {
      const r = await fetch(`/api/track?code=${n}`, { cache: "no-store" });
      if (!r.ok && r.status !== 400) throw new Error("bad");
      setRes(await r.json());
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="cp-sec" id="track">
      <Reveal className="cp-wrap">
        <Head e="tr_eyebrow" t="tr_title" l="tr_lead" />
        <form className="cp-trk" onSubmit={go}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("tr_ph")}
            inputMode="numeric"
            aria-label={t("tr_title")}
          />
          <button className="cp-btn" disabled={busy}>{busy ? t("auth_wait") : t("tr_btn")}</button>
        </form>
        <p className="cp-mute" style={{ marginTop: 10 }}>{t("tr_hint")}</p>
        {err && <p className="cp-err" role="alert" style={{ maxWidth: 560 }}>{t("tr_err")}</p>}
        {res && !res.found && <p className="cp-err" style={{ maxWidth: 560 }}>{t("tr_none")}</p>}
        {res?.found && res.history && (
          <div className="cp-trkres" style={{ "--pc": STATUS_COLOR[res.status ?? ""] } as V}>
            <div className="cp-top">
              <b style={{ fontSize: 20 }}>{res.title}</b>
              <span className="cp-st">{t(`st_${res.status}` as Key)}</span>
            </div>
            <p className="cp-mute" style={{ margin: "0 0 14px" }}>
              {lang === "bn" && res.catBn ? res.catBn : res.cat}{res.area ? ` · ${res.area}` : ""}
            </p>
            <ul className="cp-tl">
              {res.history.map((h, i) => (
                <li key={i} className={i === res.history!.length - 1 ? "n" : "d"}>
                  {t(`st_${h.to}` as Key)}
                  <small>{new Date(h.at).toLocaleString(loc, { dateStyle: "medium", timeStyle: "short" })}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>
    </section>
  );
}

/* ---------- এলাকাভিত্তিক রিপোর্ট কার্ড ---------- */
type Area = { name: string; total: number; solved: number };

export function Areas() {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const [rows, setRows] = useState<Area[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/areas")
      .then((r) => r.json())
      .then((d: Area[]) => live && setRows(Array.isArray(d) ? d : []))
      .catch(() => live && setRows([]));
    return () => { live = false; };
  }, []);

  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="ar_eyebrow" t="ar_title" l="ar_lead" />
        {rows === null && (
          <div className="cp-areas">
            {[0, 1, 2].map((i) => (<div key={i} className="cp-skel" style={{ height: 130 }} />))}
          </div>
        )}
        {rows && rows.length === 0 && <p className="cp-mute">{t("ar_empty")}</p>}
        {rows && rows.length > 0 && (
          <div className="cp-areas">
            {rows.map((a) => {
              const pct = a.total ? Math.round((a.solved / a.total) * 100) : 0;
              return (
                <div className="cp-card" key={a.name} onPointerMove={tilt} onPointerLeave={untilt}>
                  <div className="cp-ring" style={{ "--pct": `${pct}%` } as V}><b>{pct.toLocaleString(loc)}%</b></div>
                  <div>
                    <h3>{a.name}</h3>
                    <p>{t("ar_total")}: {a.total.toLocaleString(loc)}</p>
                    <p>{t("ar_solved")}: {a.solved.toLocaleString(loc)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Reveal>
    </section>
  );
}

/* ---------- SLA প্রতিশ্রুতি ---------- */
export function SlaPromise() {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const rows: [Key, number, string][] = [
    ["c5t", 24, "trash"], ["c2t", 48, "bulb"], ["c3t", 48, "drop"],
    ["c1t", 72, "road"], ["c4t", 96, "walk"], ["c6t", 120, "build"],
  ];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="sl_eyebrow" t="sl_title" l="sl_lead" />
        <div className="cp-lb">
          {rows.map(([k, h, icon]) => (
            <div className="cp-card cp-lbrow" key={k}>
              <span className="r"><Icon name="clock" /></span>
              <b className="cp-dn"><Icon name={icon} />{t(k)}</b>
              <div className="cp-track"><i style={{ "--w": `${(h / 120) * 100}%` } as V} /></div>
              <b>{h.toLocaleString(loc)} {t("sl_h")}</b>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- নিরাপত্তা ---------- */
export function Security() {
  const { t } = useLang();
  const S: { icon: string; tt: Key; d: Key }[] = [
    { icon: "lock", tt: "sc1t", d: "sc1d" },
    { icon: "shield", tt: "sc2t", d: "sc2d" },
    { icon: "clock", tt: "sc3t", d: "sc3d" },
    { icon: "file", tt: "sc4t", d: "sc4d" },
  ];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="sc_eyebrow" t="sc_title" l="sc_lead" />
        <div className="cp-four">
          {S.map((s) => (
            <div className="cp-card" key={s.tt} onPointerMove={tilt} onPointerLeave={untilt}>
              <Ico name={s.icon} lg />
              <h3>{t(s.tt)}</h3>
              <p>{t(s.d)}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- যা আসছে ---------- */
export function Roadmap() {
  const { t } = useLang();
  const R: { icon: string; tt: Key; d: Key }[] = [
    { icon: "cam", tt: "rm1t", d: "rm1d" },
    { icon: "mic", tt: "rm2t", d: "rm2d" },
    { icon: "globe", tt: "rm3t", d: "rm3d" },
    { icon: "chart", tt: "rm4t", d: "rm4d" },
  ];
  return (
    <section className="cp-sec">
      <Reveal className="cp-wrap">
        <Head e="rm_eyebrow" t="rm_title" l="rm_lead" />
        <div className="cp-four">
          {R.map((r) => (
            <div className="cp-card" key={r.tt} onPointerMove={tilt} onPointerLeave={untilt}>
              <Ico name={r.icon} lg />
              <h3>{t(r.tt)}</h3>
              <p>{t(r.d)}</p>
              <span className="cp-chip" style={{ color: "var(--cp-amb)" }}>{t("rm_soon")}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}