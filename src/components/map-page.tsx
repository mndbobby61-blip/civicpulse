import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import AppShell from "./app-shell";
import MapView from "./map-view-loader";

export default async function MapPage() {
  const s = await getSession();
  const rows = await db.issue.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true, seq: true, title: true, status: true, lat: true, lng: true, createdAt: true,
      category: { select: { name: true, nameBn: true } },
    },
  });
  const view = (
    <MapView
      loggedIn={!!s}
      issues={rows.map((r) => ({
        id: r.id, seq: r.seq, title: r.title, status: r.status, lat: r.lat, lng: r.lng,
        cat: r.category.name, catBn: r.category.nameBn, at: r.createdAt.toISOString(),
      }))}
    />
  );
  return s ? <AppShell role={s.role}>{view}</AppShell> : <div className="cp-wrap cp-dash">{view}</div>;
}