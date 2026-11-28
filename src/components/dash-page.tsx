import { Suspense } from "react";
import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import { computeHealth } from "@/lib/health";
import { loadScores, toProgress } from "@/lib/gamify";
import DashHome from "./dash-home";
import type { ChartData } from "./analytics";
import type { Role, Prisma } from "@/generated/prisma/client";

async function loadCharts(scope: Prisma.IssueWhereInput): Promise<ChartData> {
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [recent, byCat, byStatus, resolved, cats, depts, staffTasks] = await Promise.all([
    db.issue.findMany({ where: { ...scope, createdAt: { gte: since } }, select: { createdAt: true } }),
    db.issue.groupBy({ by: ["categoryId"], where: scope, _count: { _all: true } }),
    db.issue.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    db.issue.findMany({
      where: { ...scope, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true, departmentId: true },
    }),
    db.category.findMany(),
    db.department.findMany(),
    // Staff workload data
    db.user.findMany({
      where: { role: "STAFF", isActive: true },
      select: {
        name: true,
        tasksAssigned: {
          where: { status: { in: ["PENDING", "IN_PROGRESS", "COMPLETED"] } },
          select: { status: true },
        },
      },
      take: 20,
    }),
  ]);

  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const months: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months[key(d)] = 0;
  }
  recent.forEach((r) => {
    const k = key(r.createdAt);
    if (k in months) months[k]++;
  });

  const sum: Record<string, { total: number; n: number }> = {};
  resolved.forEach((r) => {
    const h = (r.resolvedAt!.getTime() - r.createdAt.getTime()) / 3_600_000;
    const s = (sum[r.departmentId] ??= { total: 0, n: 0 });
    s.total += h;
    s.n++;
  });

  const workload = staffTasks
    .filter((u) => u.tasksAssigned.length > 0)
    .map((u) => ({
      name: u.name.length > 10 ? u.name.slice(0, 10) + "…" : u.name,
      active: u.tasksAssigned.filter((t) => t.status !== "COMPLETED").length,
      done: u.tasksAssigned.filter((t) => t.status === "COMPLETED").length,
    }))
    .slice(0, 15);

  return {
    trend: Object.entries(months).map(([m, n]) => ({ m, n })),
    cats: byCat.map((c) => {
      const cat = cats.find((x) => x.id === c.categoryId);
      return { name: cat?.name ?? "?", nameBn: cat?.nameBn ?? null, n: c._count._all };
    }),
    status: byStatus.map((s) => ({ s: s.status, n: s._count._all })),
    depts: depts
      .filter((d) => sum[d.id])
      .map((d) => ({ name: d.name, nameBn: d.nameBn, hours: Math.round(sum[d.id].total / sum[d.id].n) })),
    workload,
  };
}

async function DashData({ role }: { role: Role }) {
  const user = await requireRole(role);
  const base: Prisma.IssueWhereInput =
    role === "CITIZEN" ? { reporterId: user.id }
    : role === "MANAGER" ? { departmentId: user.departmentId ?? "none" }
    : role === "STAFF" ? { tasks: { some: { assigneeId: user.id } } }
    : {};

  const [total, open, resolved, charts, health, scores, citizenFb] = await Promise.all([
    db.issue.count({ where: base }),
    db.issue.count({ where: { ...base, status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    db.issue.count({ where: { ...base, status: { in: ["RESOLVED", "CLOSED"] } } }),
    role === "ADMIN" || role === "MANAGER" ? loadCharts(base) : Promise.resolve(undefined),
    role === "ADMIN" ? computeHealth() : Promise.resolve(undefined),
    role === "CITIZEN" ? loadScores() : Promise.resolve(undefined),
    // Citizen-এর নিজস্ব রিপোর্টের গড় রেটিং fetch
    role === "CITIZEN"
      ? db.feedback.aggregate({ where: { issue: { reporterId: user.id } }, _avg: { rating: true } })
      : Promise.resolve(null),
  ]);

  const citizenExtra = role === "CITIZEN" && scores
    ? {
        myTotal: total,
        myResolved: resolved,
        avgRating: citizenFb?._avg?.rating ?? null,
        points: scores.get(user.id)?.points ?? 0,
      }
    : undefined;

  return (
    <DashHome
      name={user.name}
      role={user.role}
      stats={{ total, open, resolved }}
      charts={charts}
      health={health}
      progress={scores ? toProgress(scores.get(user.id)) : undefined}
      citizenExtra={citizenExtra}
    />
  );
}

export default function DashPage({ role }: { role: Role }) {
  return (
    <Suspense
      fallback={
        <main className="cp-wrap cp-dash" aria-busy="true">
          <div className="cp-skel" style={{ height: 56, width: "60%" }} />
          <div className="cp-skel" style={{ height: 120, marginTop: 40 }} />
        </main>
      }
    >
      <DashData role={role} />
    </Suspense>
  );
}