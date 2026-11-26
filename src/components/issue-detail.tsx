import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole, homeFor } from "@/lib/permissions";
import { priorityParts } from "@/lib/priority";
import AppShell from "./app-shell";
import IssueView from "./issue-view";
import Engage from "./engage";

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
      tasks: { include: { assignee: true }, orderBy: { createdAt: "desc" } },
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
    </AppShell>
  );
}