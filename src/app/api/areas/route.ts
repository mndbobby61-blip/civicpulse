import { connection } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await connection();
  const [all, done] = await Promise.all([
    db.issue.groupBy({ by: ["areaName"], where: { areaName: { not: null } }, _count: { _all: true } }),
    db.issue.groupBy({
      by: ["areaName"],
      where: { areaName: { not: null }, status: { in: ["RESOLVED", "CLOSED"] } },
      _count: { _all: true },
    }),
  ]);
  const rows = all
    .map((a) => ({
      name: a.areaName as string,
      total: a._count._all,
      solved: done.find((d) => d.areaName === a.areaName)?._count._all ?? 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  return Response.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}