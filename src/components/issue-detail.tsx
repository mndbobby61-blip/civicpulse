import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole, homeFor } from "@/lib/permissions";
import { priorityParts } from "@/lib/priority";
import AppShell from "./app-shell";
import IssueView from "./issue-view";
import Engage from "./engage";
import IssueAdvancedPanels from "./issue-advanced-panels";

export default async function IssueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole();

  const issue = await db.issue.findUnique({
    where: { id },
    include: {
      category: true,
      department: true,
      reporter: true,
      images: true,
      history: { include: { changedBy: true }, orderBy: { createdAt: "asc" } },
      tasks: { include: { assignee: true, reports: { orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } },
      duplicateOf: { select: { id: true, seq: true, title: true } },
      duplicates: { select: { id: true, seq: true, title: true, status: true }, orderBy: { createdAt: "asc" } },
      feedbacks: { where: { userId: user.id } },
      upvotes: { where: { userId: user.id } },
      comments: { include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!issue) notFound();

  const hasTask = issue.tasks.some((t) => t.assigneeId === user.id);
  const isMgr = user.role === "ADMIN" || (user.role === "MANAGER" && issue.departmentId === user.departmentId);
  // নাগরিকরা সবার ইস্যু দেখতে পায় (ভোট ও আলোচনার জন্য), কিন্তু বদলাতে পারে না
  const canSee = isMgr || user.role === "CITIZEN" || (user.role === "STAFF" && hasTask);
  if (!canSee) notFound();

  const s = issue.status;
  const isStaff = user.role === "STAFF" && hasTask;
  const own = user.role === "CITIZEN" && issue.reporterId === user.id;
  const can = {
    review: isMgr && s === "SUBMITTED",
    assign: isMgr && s === "UNDER_REVIEW",
    close: isMgr && s === "RESOLVED",
    reopen: isMgr && s === "RESOLVED",
    start: isStaff && s === "ASSIGNED",
    done: isStaff && s === "IN_PROGRESS",
    rate: own && (s === "RESOLVED" || s === "CLOSED"),
  };

  let staff: { id: string; name: string; load: number }[] = [];
  if (can.assign) {
    const list = await db.user.findMany({
      where: { role: "STAFF", isActive: true, departmentId: issue.departmentId },
      include: { _count: { select: { tasksAssigned: { where: { status: { not: "COMPLETED" } } } } } },
    });
    staff = list.map((u) => ({ id: u.id, name: u.name, load: u._count.tasksAssigned })).sort((a, b) => a.load - b.load);
  }

  const showReporter = !issue.isAnonymous || isMgr || issue.reporterId === user.id;
  const parts = priorityParts(issue, Date.now());
  const [allCats, rawNotes] = await Promise.all([
    isMgr
      ? db.category.findMany({ include: { department: { select: { name: true } } }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
    isMgr || isStaff
      ? db.auditLog.findMany({
          where: { entity: "InternalNote", entityId: issue.id },
          orderBy: { createdAt: "asc" },
          take: 100,
        })
      : Promise.resolve([]),
  ]);
  const taskReports = issue.tasks.flatMap((t) =>
    t.reports.map((r) => ({ id: r.id, description: r.description, photos: r.photos, at: r.createdAt.toISOString() }))
  );
  const internalNotes = rawNotes.map((n) => {
    const m = (n.meta ?? {}) as { text?: string; authorName?: string; authorRole?: string };
    return {
      id: n.id,
      text: m.text ?? "",
      by: m.authorName ?? "Team",
      role: m.authorRole ?? "STAFF",
      at: n.createdAt.toISOString(),
    };
  });
  const fb = issue.feedbacks[0] ?? null;

  // Status history + comments merge করে timeline বানাই
  const timeline: Array<{ id: string; type: "status" | "comment"; by: string; role: string; text: string; from?: string | null; to?: string; at: string }> = [
    ...issue.history.map((h) => ({
      id: h.id,
      type: "status" as const,
      by: h.changedBy.name,
      role: h.changedBy.role,
      text: h.note ?? "",
      from: h.fromStatus ?? null,
      to: h.toStatus,
      at: h.createdAt.toISOString(),
    })),
    ...issue.comments.map((c) => ({
      id: c.id,
      type: "comment" as const,
      by: c.user.name,
      role: c.user.role,
      text: c.text,
      at: c.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <AppShell role={user.role} home={homeFor(user.role)}>
      <IssueView
        can={can}
        staff={staff}
        d={{
          id: issue.id, seq: issue.seq, title: issue.title, description: issue.description,
          status: issue.status, priority: issue.priority,
          images: issue.images.map((i) => i.url),
          cat: issue.category.name, catBn: issue.category.nameBn,
          dept: issue.department.name, deptBn: issue.department.nameBn,
          address: issue.address, lat: issue.lat, lng: issue.lng, votes: issue.upvoteCount,
          slaDueAt: issue.slaDueAt?.toISOString() ?? null,
          reporter: showReporter ? issue.reporter.name : null,
          assignee: issue.tasks[0]?.assignee.name ?? null,
          rating: issue.feedbacks[0]?.rating ?? null,
          history: issue.history.map((h) => ({
            id: h.id, from: h.fromStatus, to: h.toStatus, by: h.changedBy.name,
            note: h.note, at: h.createdAt.toISOString(),
          })),
        }}
      />
      <Engage
        issueId={issue.id}
        votes={issue.upvoteCount}
        voted={issue.upvotes.length > 0}
        canVote={user.role === "CITIZEN" && !own && s !== "CLOSED"}
        own={own}
        parts={parts}
        comments={issue.comments.map((c) => ({
          id: c.id, name: c.user.name, role: c.user.role, text: c.text, at: c.createdAt.toISOString(),
          canDelete: c.userId === user.id || isMgr,
        }))}
      />
      <IssueAdvancedPanels
        issueId={issue.id}
        currentPriority={issue.priority}
        currentCategoryId={issue.categoryId}
        reportImages={issue.images.filter((i) => i.type === "REPORT").map((i) => i.url)}
        completionImages={issue.images.filter((i) => i.type === "COMPLETION").map((i) => i.url)}
        taskReports={taskReports}
        duplicateOf={issue.duplicateOf}
        duplicates={issue.duplicates}
        categories={allCats.map((c) => ({ id: c.id, name: c.name, nameBn: c.nameBn, deptName: c.department.name }))}
        feedback={fb ? { rating: fb.rating, comment: fb.comment } : null}
        internalNotes={internalNotes}
        timeline={timeline}
        perms={{
          canStaffReport: (isStaff || user.role === "ADMIN") && issue.tasks.length > 0 && s !== "CLOSED",
          canTriage: isMgr && s !== "CLOSED",
          canReview: can.rate,
          canSeeInternal: isMgr || isStaff,
        }}
      />
    </AppShell>
  );
}