import { db } from "@/lib/db";
import { requireRole, homeFor } from "@/lib/permissions";
import { STATUSES } from "@/lib/ui";
import { priorityParts, slaHoursLeft } from "@/lib/priority";
import AppShell from "./app-shell";
import IssuesView from "./issues-view";
import type { Prisma, IssueStatus } from "@/generated/prisma/client";

const PAGE = 10;
type SP = { q?: string; status?: string; page?: string; sort?: string; scope?: string };
type R = Prisma.IssueGetPayload<{ include: { category: true } }>;

export default async function IssuesList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const user = await requireRole();

  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim().slice(0, 80);
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as IssueStatus) : undefined;
  const sort = sp.sort === "priority" ? "priority" : "";
  const scope = user.role === "CITIZEN" && sp.scope === "all" ? "all" : "";

  // কে কোন ইস্যু দেখতে পাবে, সবই সার্ভারে ঠিক হয়
  const base: Prisma.IssueWhereInput =
    user.role === "CITIZEN" ? (scope ? {} : { reporterId: user.id })
    : user.role === "MANAGER" ? { departmentId: user.departmentId ?? "none" }
    : user.role === "STAFF" ? { tasks: { some: { assigneeId: user.id } } }
    : {};

  const where: Prisma.IssueWhereInput = {
    ...base,
    ...(status ? { status } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };

  const now = Date.now();
  const total = await db.issue.count({ where });
  let rows: R[];
  if (sort === "priority") {
    // প্রায়োরিটি স্কোর হিসাব করে সাজাতে প্রথম ৫০০টা আনা হয়
    const all = await db.issue.findMany({ where, include: { category: true }, take: 500 });
    rows = all
      .map((r) => ({ r, s: priorityParts(r, now).total }))
      .sort((a, b) => b.s - a.s || a.r.createdAt.getTime() - b.r.createdAt.getTime())
      .slice((page - 1) * PAGE, page * PAGE)
      .map((x) => x.r);
  } else {
    rows = await db.issue.findMany({
      where, include: { category: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE,
    });
  }

  return (
    <AppShell role={user.role} home={homeFor(user.role)}>
      <IssuesView
        total={total}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE))}
        q={q}
        status={status ?? ""}
        sort={sort}
        scope={scope}
        isCitizen={user.role === "CITIZEN"}
        rows={rows.map((r) => {
          const p = priorityParts(r, now);
          return {
            id: r.id, seq: r.seq, title: r.title, status: r.status, priority: r.priority,
            cat: r.category.name, catBn: r.category.nameBn, area: r.areaName ?? r.address,
            at: r.createdAt.toISOString(), votes: r.upvoteCount,
            score: p.total, late: p.sla > 0, hours: slaHoursLeft(r.slaDueAt, r.status, now),
          };
        })}
      />
    </AppShell>
  );
}