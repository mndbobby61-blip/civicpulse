"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";

type Result = {
  id: string; seq: number; title: string; status: string;
  priority: string; area: string; cat: string; catBn: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: "#ff5d5d", UNDER_REVIEW: "#ffb938", ASSIGNED: "#ffb938",
  IN_PROGRESS: "#ffb938", RESOLVED: "#2de2c4", CLOSED: "#8ea3ae",
};

export default function GlobalSearch() {
  const { lang } = useLang();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (r.ok) {
          const d = await r.json() as { results: Result[] };
          setResults(d.results);
          setOpen(d.results.length > 0);
        }
      } catch {}
      finally { setLoading(false); }
    }, 280);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setQ(""); inputRef.current?.blur(); } };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  return (
    <div className="cp-search-wrap" ref={ref}>
      <span className="cp-search-icon" aria-hidden>🔍</span>
      <input
        ref={inputRef}
        className="cp-search-input"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={advT(lang, "srch_placeholder")}
        aria-label={advT(lang, "srch_label")}
        autoComplete="off"
        id="cp-global-search"
      />
      {loading && (
        <span style={{ position: "absolute", right: 12, fontSize: 12, color: "var(--cp-mute)" }}>⏳</span>
      )}
      {open && results.length > 0 && (
        <div className="cp-search-dropdown" role="listbox" aria-label={advT(lang, "srch_label")}>
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/issues/${r.id}`}
              className="cp-search-item"
              role="option"
              onClick={() => { setOpen(false); setQ(""); }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLOR[r.status] ?? "#8ea3ae", flexShrink: 0 }} />
              <div>
                <b>CP-{r.seq} · {r.title}</b>
                <small>{lang === "bn" && r.catBn ? r.catBn : r.cat}{r.area ? ` · ${r.area}` : ""}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
      {open && q.length >= 2 && results.length === 0 && !loading && (
        <div className="cp-search-dropdown">
          <p className="cp-search-empty">{advT(lang, "srch_no_result")}</p>
        </div>
      )}
    </div>
  );
}
