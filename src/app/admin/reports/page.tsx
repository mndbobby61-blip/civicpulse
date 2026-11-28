import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireRole, homeFor } from "@/lib/permissions";
import AppShell from "@/components/app-shell";
import AdminReportsView from "@/components/admin-reports-view";
import type { Prisma } from "@/generated/prisma/client";

async function ReportsData() {
  const user = await requireRole("ADMIN", "MANAGER");
  const scope: Prisma.IssueWhereInput =
    user.role === "MANAGER" ? { departmentId: user.departmentId ?? "none" } : {};

  const now = new Date();
  const [total, resolved, overdue, fb, depts, deptStats, deptOverdue] = await Promise.all([
    db.issue.count({ where: scope }),
    db.issue.count({ where: { ...scope, status: { in: ["RESOLVED", "CLOSED"] } } }),
    db.issue.count({ where: { ...scope, status: { notIn: ["RESOLVED", "CLOSED"] }, slaDueAt: { lt: now } } }),
    db.feedback.aggregate({ where: { issue: scope }, _avg: { rating: true } }),
    db.department.findMany({
      where: user.role === "MANAGER" ? { id: user.departmentId ?? "none" } : {},
      orderBy: { name: "asc" },
    }),
    db.issue.groupBy({
      by: ["departmentId", "status"],
      where: scope,
      _count: { _all: true },
    }),
    db.issue.groupBy({
      by: ["departmentId"],
      where: { ...scope, status: { notIn: ["RESOLVED", "CLOSED"] }, slaDueAt: { lt: now } },
      _count: { _all: true },
    }),
  ]);

  const deptRows = depts.map((d) => {
    const mine = deptStats.filter((s) => s.departmentId === d.id);
    const dTotal = mine.reduce((acc, s) => acc + s._count._all, 0);
    const dResolved = mine
      .filter((s) => s.status === "RESOLVED" || s.status === "CLOSED")
      .reduce((acc, s) => acc + s._count._all, 0);
    const dOverdue = deptOverdue.find((o) => o.departmentId === d.id)?._count._all ?? 0;
    return { name: d.name, nameBn: d.nameBn, total: dTotal, resolved: dResolved, overdue: dOverdue };
  });

  const scopeLabel =
    user.role === "MANAGER" && deptRows[0] ? deptRows[0].name : "Citywide (All Departments)";

  return (
    <AppShell role={user.role} home={homeFor(user.role)}>
      <AdminReportsView
        summary={{
          scopeLabel,
          total,
          resolved,
          overdue,
          avgRating: fb._avg.rating,
          depts: deptRows,
        }}
      />
    </AppShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 420 }} /></div>}>
      <ReportsData />
    </Suspense>
  );
}
