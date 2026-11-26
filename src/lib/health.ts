import { db } from "./db";

export type Health = { score: number; res: number; sla: number; sat: number; late: number };

// স্কোর = ৩৫% সমাধানের হার + ২৫% সময়মতো সমাধান + ২০% নাগরিক সন্তুষ্টি + ২০% দেরি-মুক্ত ব্যাকলগ
export async function computeHealth(): Promise<Health> {
  const now = new Date();
  const [total, done, open, overdue, fb, rows] = await Promise.all([
    db.issue.count(),
    db.issue.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    db.issue.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    db.issue.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] }, slaDueAt: { lt: now } } }),
    db.feedback.aggregate({ _avg: { rating: true } }),
    db.issue.findMany({
      where: { resolvedAt: { not: null }, slaDueAt: { not: null } },
      select: { resolvedAt: true, slaDueAt: true },
      take: 3000,
    }),
  ]);
  const res = total ? done / total : 0;
  const onTime = rows.length ? rows.filter((r) => r.resolvedAt! <= r.slaDueAt!).length / rows.length : 0;
  const sat = fb._avg.rating ? fb._avg.rating / 5 : 0;
  const late = open ? 1 - overdue / open : 1;
  return {
    score: Math.round(100 * (0.35 * res + 0.25 * onTime + 0.2 * sat + 0.2 * late)),
    res: Math.round(res * 100),
    sla: Math.round(onTime * 100),
    sat: Math.round(sat * 100),
    late: Math.round(late * 100),
  };
}