import { db } from "./db";

export type Stat = { reports: number; resolved: number; ratings: number; votes: number; points: number };
export type Progress = {
  points: number;
  levelKey: string;
  pct: number;
  next: number | null;
  stat: { reports: number; resolved: number; ratings: number; votes: number };
  badges: number[];
};

const LEVELS = [
  { min: 0, key: "lv_1" },
  { min: 60, key: "lv_2" },
  { min: 150, key: "lv_3" },
  { min: 300, key: "lv_4" },
];

const RULES: ((s: Stat) => boolean)[] = [
  (s) => s.reports >= 1,
  (s) => s.reports >= 5,
  (s) => s.reports >= 15,
  (s) => s.resolved >= 3,
  (s) => s.votes >= 10,
  (s) => s.ratings >= 3,
];

const EMPTY: Stat = { reports: 0, resolved: 0, ratings: 0, votes: 0, points: 0 };

export function toProgress(s: Stat = EMPTY): Progress {
  let i = 0;
  LEVELS.forEach((l, n) => {
    if (s.points >= l.min) i = n;
  });
  const next = LEVELS[i + 1];
  const pct = next ? Math.round(((s.points - LEVELS[i].min) / (next.min - LEVELS[i].min)) * 100) : 100;
  return {
    points: s.points,
    levelKey: LEVELS[i].key,
    pct,
    next: next ? next.min : null,
    stat: { reports: s.reports, resolved: s.resolved, ratings: s.ratings, votes: s.votes },
    badges: RULES.flatMap((ok, n) => (ok(s) ? [n + 1] : [])),
  };
}

// পয়েন্ট ডাটাবেসে জমা থাকে না, প্রতিবার আসল রিপোর্ট থেকে গুনে বের হয়
export async function loadScores() {
  const [rep, res, rat, vot] = await Promise.all([
    db.issue.groupBy({ by: ["reporterId"], _count: { _all: true } }),
    db.issue.groupBy({ by: ["reporterId"], where: { status: { in: ["RESOLVED", "CLOSED"] } }, _count: { _all: true } }),
    db.feedback.groupBy({ by: ["userId"], _count: { _all: true } }),
    db.issue.groupBy({ by: ["reporterId"], _sum: { upvoteCount: true } }),
  ]);
  const m = new Map<string, Stat>();
  const get = (id: string) => {
    let s = m.get(id);
    if (!s) {
      s = { reports: 0, resolved: 0, ratings: 0, votes: 0, points: 0 };
      m.set(id, s);
    }
    return s;
  };
  rep.forEach((r) => (get(r.reporterId).reports = r._count._all));
  res.forEach((r) => (get(r.reporterId).resolved = r._count._all));
  rat.forEach((r) => (get(r.userId).ratings = r._count._all));
  vot.forEach((r) => (get(r.reporterId).votes = r._sum.upvoteCount ?? 0));
  m.forEach((s) => (s.points = s.reports * 10 + s.resolved * 20 + s.ratings * 5 + s.votes));
  return m;
}