import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import AppShell from "@/components/app-shell";
import AreasPublicView, { type AreaCardRow } from "@/components/areas-public-view";

async function AreasData() {
  await connection();
  const s = await getSession();
  const issues = await db.issue.findMany({
    where: { areaName: { not: null } },
    select: {
      areaName: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      category: { select: { name: true, nameBn: true } },
      feedbacks: { select: { rating: true } },
    },
    take: 3000,
  });

  const grouped = new Map<
    string,
    {
      total: number;
      resolved: number;
      hoursSum: number;
      hoursCount: number;
      ratingSum: number;
      ratingCount: number;
      catCounts: Map<string, { name: string; nameBn: string | null; count: number }>;
    }
  >();

  for (const i of issues) {
    const area = i.areaName!;
    let entry = grouped.get(area);
    if (!entry) {
      entry = {
        total: 0,
        resolved: 0,
        hoursSum: 0,
        hoursCount: 0,
        ratingSum: 0,
        ratingCount: 0,
        catCounts: new Map(),
      };
      grouped.set(area, entry);
    }
    entry.total += 1;
    if (i.status === "RESOLVED" || i.status === "CLOSED") entry.resolved += 1;
    if (i.resolvedAt) {
      entry.hoursSum += (i.resolvedAt.getTime() - i.createdAt.getTime()) / 3_600_000;
      entry.hoursCount += 1;
    }
    for (const f of i.feedbacks) {
      entry.ratingSum += f.rating;
      entry.ratingCount += 1;
    }
    const existingCat = entry.catCounts.get(i.category.name) ?? {
      name: i.category.name,
      nameBn: i.category.nameBn,
      count: 0,
    };
    existingCat.count += 1;
    entry.catCounts.set(i.category.name, existingCat);
  }

  const rows: AreaCardRow[] = Array.from(grouped.entries())
    .map(([area, g]) => {
      const topCat = Array.from(g.catCounts.values()).sort((a, b) => b.count - a.count)[0];
      return {
        area,
        total: g.total,
        resolved: g.resolved,
        avgHours: g.hoursCount ? Math.round(g.hoursSum / g.hoursCount) : null,
        avgRating: g.ratingCount ? g.ratingSum / g.ratingCount : null,
        topCategory: topCat?.name ?? "-",
        topCategoryBn: topCat?.nameBn ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);

  const view = <AreasPublicView rows={rows} loggedIn={!!s} />;
  return s ? <AppShell role={s.role}>{view}</AppShell> : <div className="cp-wrap cp-dash">{view}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 420 }} /></div>}>
      <AreasData />
    </Suspense>
  );
}
