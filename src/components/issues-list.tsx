import { db } from "@/lib/db";
import { requireRole, homeFor } from "@/lib/permissions";
import { STATUSES } from "@/lib/ui";
import AppShell from "./app-shell";
import IssuesView from "./issues-view";
import type { Prisma, IssueStatus } from "@/generated/prisma/client";

const PAGE = 10;
type SP = { q?: string; status?: string; page?: string };

export default async function IssuesList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const user = await requireRole();

  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim().slice(0, 80);
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as IssueStatus) : undefined;

  // কে কোন ইস্যু দেখতে পাবে, সবই সার্ভারে ঠিক হয়
  const scope: Prisma.IssueWhereInput =
    user.role === "CITIZEN" ? { reporterId: user.id }
    : user.role === "MANAGER" ? { departmentId: user.departmentId ?? "none" }
    : user.role === "STAFF" ? { tasks: { some: { assigneeId: user.id } } }
    : {};

  const where: Prisma.IssueWhereInput = {
    ...scope,
    ...(status ? { status } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };

  const [total, rows] = await Promise.all([
    db.issue.count({ where }),
    db.issue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: { category: true },
    }),
  ]);

  return (
    <AppShell role={user.role} home={homeFor(user.role)}>
      <IssuesView
        total={total}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE))}
        q={q}
        status={status ?? ""}
        rows={rows.map((r) => ({
          id: r.id, seq: r.seq, title: r.title, status: r.status, priority: r.priority,
          cat: r.category.name, catBn: r.category.nameBn, area: r.areaName ?? r.address,
          at: r.createdAt.toISOString(), votes: r.upvoteCount,
        }))}
      />
    </AppShell>
  );
}