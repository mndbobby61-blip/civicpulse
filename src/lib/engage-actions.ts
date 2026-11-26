"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { requireRole } from "./permissions";

// ভোট: শুধু নাগরিক, নিজের ইস্যুতে নয়, বন্ধ ইস্যুতে নয়। আবার চাপলে ভোট উঠে যায়।
export async function toggleUpvoteAction(fd: FormData) {
  const user = await requireRole("CITIZEN");
  const id = String(fd.get("issueId") ?? "");
  const issue = await db.issue.findUnique({ where: { id } });
  if (!issue || issue.reporterId === user.id || issue.status === "CLOSED") return;

  const key = { userId_issueId: { userId: user.id, issueId: id } };
  await db.$transaction(async (tx) => {
    const ex = await tx.upvote.findUnique({ where: key });
    if (ex) {
      await tx.upvote.delete({ where: key });
      await tx.issue.update({ where: { id }, data: { upvoteCount: { decrement: 1 } } });
    } else {
      await tx.upvote.create({ data: { userId: user.id, issueId: id } });
      await tx.issue.update({ where: { id }, data: { upvoteCount: { increment: 1 } } });
    }
  });
  revalidatePath(`/issues/${id}`);
  revalidatePath("/issues");
}

const commentSchema = z.object({
  issueId: z.string().min(1),
  text: z.string().trim().min(2).max(500),
});

export async function addCommentAction(fd: FormData) {
  const user = await requireRole();
  const p = commentSchema.safeParse({ issueId: fd.get("issueId"), text: fd.get("text") });
  if (!p.success) return;

  const issue = await db.issue.findUnique({
    where: { id: p.data.issueId },
    include: { tasks: { select: { assigneeId: true } } },
  });
  if (!issue) return;

  const can =
    user.role === "ADMIN" ||
    user.role === "CITIZEN" ||
    (user.role === "MANAGER" && issue.departmentId === user.departmentId) ||
    (user.role === "STAFF" && issue.tasks.some((t) => t.assigneeId === user.id));
  if (!can) return;

  await db.$transaction(async (tx) => {
    await tx.comment.create({ data: { issueId: issue.id, userId: user.id, text: p.data.text } });
    if (issue.reporterId !== user.id) {
      await tx.notification.create({
        data: { userId: issue.reporterId, type: "COMMENT", message: issue.title, issueId: issue.id },
      });
    }
  });
  revalidatePath(`/issues/${issue.id}`);
}

export async function deleteCommentAction(fd: FormData) {
  const user = await requireRole();
  const id = String(fd.get("id") ?? "");
  const c = await db.comment.findUnique({ where: { id }, include: { issue: { select: { departmentId: true } } } });
  if (!c) return;
  const can =
    c.userId === user.id ||
    user.role === "ADMIN" ||
    (user.role === "MANAGER" && c.issue.departmentId === user.departmentId);
  if (!can) return;
  await db.comment.delete({ where: { id } });
  await db.auditLog.create({ data: { userId: user.id, action: "DELETE_COMMENT", entity: "Issue", entityId: c.issueId } });
  revalidatePath(`/issues/${c.issueId}`);
}