"use client";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";
import type { Key } from "@/lib/dict";

export type ChartData = {
  trend: { m: string; n: number }[];
  cats: { name: string; nameBn: string | null; n: number }[];
  status: { s: string; n: number }[];
  depts: { name: string; nameBn: string | null; hours: number }[];
  workload?: { name: string; active: number; done: number }[];
};

const COLORS = ["#2de2c4", "#c8f542", "#8b7bff", "#ffb938", "#ff5d5d", "#5b6cf0"];
const tip = {
  contentStyle: {
    background: "var(--cp-card)",
    border: "1px solid var(--cp-line)",
    borderRadius: 14,
    color: "var(--cp-ink)",
  },
};

export default function Analytics({ d }: { d: ChartData }) {
  const { t, lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-GB";
  const nm = (a: { name: string; nameBn: string | null }) => (lang === "bn" && a.nameBn ? a.nameBn : a.name);

  const trend = d.trend.map((x) => ({
    n: x.n,
    label: new Date(x.m + "-01T00:00:00").toLocaleDateString(loc, { month: "short" }),
  }));
  const cats = d.cats.map((c) => ({ name: nm(c), n: c.n }));
  const status = d.status.map((s) => ({ name: t(`st_${s.s}` as Key), n: s.n }));
  const depts = d.depts.map((x) => ({ name: nm(x), hours: x.hours }));

  return (
    <div className="cp-charts">
      <div className="cp-chartcard wide">
        <h3>{t("an_trend")}</h3>
        <div className="box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2de2c4" stopOpacity={0.5} />
                  <stop offset="1" stopColor="#2de2c4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,150,160,.25)" />
              <XAxis dataKey="label" stroke="#8ea3ae" />
              <YAxis stroke="#8ea3ae" allowDecimals={false} />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="n" stroke="#2de2c4" strokeWidth={3} fill="url(#gt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cp-chartcard">
        <h3>{t("an_cat")}</h3>
        <div className="box">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={cats} dataKey="n" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {cats.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cp-chartcard">
        <h3>{t("an_status")}</h3>
        <div className="box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={status} layout="vertical" margin={{ left: 16 }}>
              <XAxis type="number" stroke="#8ea3ae" allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#8ea3ae" width={92} />
              <Tooltip {...tip} />
              <Bar dataKey="n" radius={[0, 10, 10, 0]} fill="#8b7bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cp-chartcard wide">
        <h3>{t("an_dept")}</h3>
        <div className="box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depts}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,150,160,.25)" />
              <XAxis dataKey="name" stroke="#8ea3ae" />
              <YAxis stroke="#8ea3ae" />
              <Tooltip {...tip} />
              <Bar dataKey="hours" radius={[10, 10, 0, 0]} fill="#c8f542" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {d.workload && d.workload.length > 0 && (
        <div className="cp-chartcard wide">
          <h3>{advT(lang, "wl_title")}</h3>
          <div className="box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,150,160,.25)" />
                <XAxis dataKey="name" stroke="#8ea3ae" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8ea3ae" allowDecimals={false} />
                <Tooltip {...tip} />
                <Bar dataKey="active" name={lang === "bn" ? "চলমান" : "Active"} radius={[6, 6, 0, 0]} fill="#ffb938" stackId="a" />
                <Bar dataKey="done" name={lang === "bn" ? "সম্পন্ন" : "Completed"} radius={[6, 6, 0, 0]} fill="#2de2c4" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}