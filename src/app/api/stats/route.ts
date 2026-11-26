import { db } from "@/lib/db";
import { connection } from "next/server";

export async function GET() {
  await connection();
  const [total, resolved, good, allFb, done] = await Promise.all([
    db.issue.count(),
    db.issue.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    db.feedback.count({ where: { rating: { gte: 4 } } }),
    db.feedback.count(),
    db.issue.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 2000,
    }),
  ]);
  const hours = done.length
    ? Math.round(done.reduce((a, r) => a + (r.resolvedAt!.getTime() - r.createdAt.getTime()), 0) / done.length / 3_600_000)
    : 0;
  return Response.json(
    { total, resolved, hours, satisfied: allFb ? Math.round((good / allFb) * 100) : 0 },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}