"use client";
import { useRef } from "react";
import { Icon } from "./icon";
import { useLang } from "./lang-provider";
import Link from "next/link";
import ReportLink from "./report-link";

type V = React.CSSProperties;
const faces1 = ["bulb", "road", "drop", "trash", "build", "shield"];
const faces2 = ["cam", "wrench", "check", "walk", "file", "clock"];

export default function Hero() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);

  function onMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  }

  return (
    <header className="cp-hero" ref={ref} onPointerMove={onMove}>
      <div className="cp-stage" aria-hidden="true">
        <div className="cp-fl3 cp-hm" style={{ left: "80%", top: "8%", "--k": 26, perspective: 700 } as V}>
          <div className="cp-cube" style={{ "--s": "86px" } as V}>
            {faces1.map((n) => (<i key={n}><Icon name={n} /></i>))}
          </div>
        </div>
        <div className="cp-fl3 cp-hm" style={{ left: "46%", top: "70%", "--k": -34, perspective: 700 } as V}>
          <div className="cp-cube" style={{ "--s": "58px", animationDuration: "12s" } as V}>
            {faces2.map((n) => (<i key={n}><Icon name={n} /></i>))}
          </div>
        </div>
        <div className="cp-fl3" style={{ left: "58%", top: "30%", "--k": 18 } as V}>
          <div className="cp-p3d"><Icon name="cam" /></div>
        </div>
        <div className="cp-fl3 cp-hm" style={{ left: "70%", top: "66%", "--k": -22 } as V}>
          <div className="cp-p3d" style={{ animationDelay: "-2s" }}><Icon name="wrench" /></div>
        </div>
        <div className="cp-fl3 cp-hm" style={{ left: "4%", top: "76%", "--k": 30 } as V}>
          <div className="cp-orb" style={{ width: 84, height: 84 }} />
        </div>
        <div className="cp-fl3 cp-hm" style={{ left: "52%", top: "8%", "--k": -16 } as V}>
          <div className="cp-orb" style={{ width: 44, height: 44, animationDelay: "-3s" }} />
        </div>
      </div>

      <div className="cp-map" aria-hidden="true">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <use href="#city" />
          {[[180,300,.4],[430,190,1.1],[610,295,1.8],[810,190,2.4],[880,410,.8]].map(([x,y,d]) => (
            <circle key={`${x}-${y}`} className="cp-pin" cx={x} cy={y} r="4" style={{ animationDelay: `${d}s` }} />
          ))}
        </svg>
      </div>

    <div className="cp-wrap">
        <div>
          <div className="cp-badge"><i>{t("badge_new")}</i> {t("badge_text")}</div>
          <h1 className="cp-h1">{t("h1a")}<span className="cp-grad">{t("h1b")}</span>{t("h1c")}</h1>
          <p className="cp-sub">{t("sub")}</p>
          <div className="cp-row">
                        <ReportLink className="cp-btn">{t("btn_report")}</ReportLink>
            <Link href="/map" className="cp-btn ghost">{t("btn_map")}</Link>
          </div>
        </div>
        <div className="cp-floatwrap">
          <div className="cp-float">
            <div className="cp-top"><span className="cp-id">#CP-2041</span><span className="cp-chip">{t("chip")}</span></div>
            <ul className="cp-tl">
              <li className="d">{t("tl1")}<small>{t("tl1t")}</small></li>
              <li className="d">{t("tl2")}<small>{t("tl2t")}</small></li>
              <li className="n">{t("tl3")}<small>{t("tl3t")}</small></li>
              <li>{t("tl4")}</li>
            </ul>
            <div className="cp-notif">{t("notif")}</div>
          </div>
        </div>
      </div>

      <div className="cp-wrap">
        <svg className="cp-pulse" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 44H260l20-8 18 8h40l14-36 22 70 18-34h30l14 10h110l16-20 22 40 14-20H1000" />
        </svg>
      </div>
    </header>
  );
}