import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireRole, homeFor } from "@/lib/permissions";
import AppShell from "@/components/app-shell";
import StaffRouteView from "@/components/staff-route-view";

async function RouteData() {
  const user = await requireRole("STAFF", "ADMIN");
  const tasks = await db.task.findMany({
    where: {
      ...(user.role === "STAFF" ? { assigneeId: user.id } : {}),
      status: { not: "COMPLETED" },
      issue: { status: { notIn: ["RESOLVED", "CLOSED"] } },
    },
    include: {
      issue: {
        include: { category: { select: { name: true, nameBn: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const seen = new Set<string>();
  const stops = tasks.flatMap((t) => {
    if (seen.has(t.issue.id)) return [];
    seen.add(t.issue.id);
    return [
      {
        id: t.issue.id,
        seq: t.issue.seq,
        title: t.issue.title,
        address: t.issue.address,
        lat: t.issue.lat,
        lng: t.issue.lng,
        status: t.issue.status,
        priority: t.issue.priority,
        slaDueAt: t.issue.slaDueAt?.toISOString() ?? null,
        cat: t.issue.category.name,
        catBn: t.issue.category.nameBn,
      },
    ];
  });

  return (
    <AppShell role={user.role} home={homeFor(user.role)}>
      <StaffRouteView stops={stops} />
    </AppShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 420 }} /></div>}>
      <RouteData />
    </Suspense>
  );
}
