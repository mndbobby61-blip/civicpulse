import { Suspense } from "react";
import { connection } from "next/server";

import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import AppShell from "@/components/app-shell";
import City3DTwin, { type Area3DNode } from "@/components/city-3d-twin";

async function City3DData() {
  await connection();
  const [s, issues] = await Promise.all([
    getSession(),
    db.issue.findMany({
      where: { areaName: { not: null } },
      select: { areaName: true, status: true },
      take: 2500,
    }),
  ]);

  const map = new Map<string, { total: number; solved: number }>();
  for (const i of issues) {
    const k = i.areaName!;
    const cur = map.get(k) ?? { total: 0, solved: 0 };
    cur.total += 1;
    if (i.status === "RESOLVED" || i.status === "CLOSED") cur.solved += 1;
    map.set(k, cur);
  }

  const areas: Area3DNode[] = Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      total: v.total,
      solved: v.solved,
      open: Math.max(0, v.total - v.solved),
      rate: v.total ? Math.round((v.solved / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 16);

  const body = (
    <>
      {!s && <Link href="/" className="cp-back">← CivicPulse</Link>}
      <h1 className="cp-pagetitle">3D City Pulse Digital Twin</h1>
      <p className="cp-lead" style={{ marginBottom: 20 }}>
        Interactive 3D visualization of live Dhaka area reports, resolution towers, and active hotspots.
      </p>
      <City3DTwin areas={areas} height={540} />
    </>
  );

  return s ? <AppShell role={s.role}>{body}</AppShell> : <div className="cp-wrap cp-dash">{body}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 520 }} /></div>}>
      <City3DData />
    </Suspense>
  );
}
