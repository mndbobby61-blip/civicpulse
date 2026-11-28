import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import AppShell from "@/components/app-shell";
import SmartZoneMap from "@/components/smart-zone-map";

async function ZoneMapData() {
  await connection();
  const [s, rows] = await Promise.all([
    getSession(),
    db.issue.findMany({
      orderBy: { createdAt: "desc" },
      take: 600,
      select: {
        id: true,
        seq: true,
        title: true,
        status: true,
        lat: true,
        lng: true,
        areaName: true,
        category: { select: { name: true, nameBn: true } },
      },
    }),
  ]);

  const view = (
    <SmartZoneMap
      loggedIn={!!s}
      issues={rows.map((r) => ({
        id: r.id,
        seq: r.seq,
        title: r.title,
        status: r.status,
        lat: r.lat,
        lng: r.lng,
        area: r.areaName,
        cat: r.category.name,
        catBn: r.category.nameBn,
      }))}
    />
  );

  return s ? <AppShell role={s.role}>{view}</AppShell> : <div className="cp-wrap cp-dash">{view}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 500 }} /></div>}>
      <ZoneMapData />
    </Suspense>
  );
}
