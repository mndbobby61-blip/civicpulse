"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { requireRole } from "./permissions";
import type { IssueStatus } from "@/generated/prisma/client";

export type IssueState = { error?: "fields" };

const createSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(2000),
  categoryId: z.string().min(1),
  address: z.string().trim().min(3).max(200),
  lat: z.coerce.number().min(20).max(27),
  lng: z.coerce.number().min(87).max(93),
});

// ---------- ১. নাগরিক ইস্যু জমা দেয় ----------
export async function createIssueAction(_: IssueState, fd: FormData): Promise<IssueState> {
  const user = await requireRole("CITIZEN");
  const p = createSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "fields" };
  const d = p.data;

    // শুধু আমাদের Cloudinary অ্যাকাউন্টের ছবির লিংক নেওয়া হয়, সর্বোচ্চ ৩টা
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  const images = cloud
    ? fd.getAll("images").map(String).filter((u) => u.startsWith(`https://res.cloudinary.com/${cloud}/`)).slice(0, 3)
    : [];

  const cat = await db.category.findUnique({ where: { id: d.categoryId } });
  if (!cat) return { error: "fields" };

  // ৫০ মিটারের (প্রায় ০.০০০৪৫°) মধ্যে একই ক্যাটেগরির খোলা ইস্যু থাকলে ডুপ্লিকেট ধরা হয়
  const delta = 0.00045;
  const dup = await db.issue.findFirst({
    where: {
      categoryId: cat.id,
      duplicateOfId: null,
      status: { notIn: ["RESOLVED", "CLOSED"] },
      lat: { gte: d.lat - delta, lte: d.lat + delta },
      lng: { gte: d.lng - delta, lte: d.lng + delta },
    },
    orderBy: { createdAt: "asc" },
  });

  const issue = await db.$transaction(async (tx) => {
    const created = await tx.issue.create({
      data: {
        title: d.title,
        description: d.description,
        address: d.address,
        areaName: String(fd.get("areaName") ?? "").trim().slice(0, 80) || null,
        lat: d.lat,
        lng: d.lng,
        categoryId: cat.id,
        departmentId: cat.departmentId,
        reporterId: user.id,
        isAnonymous: fd.get("anon") === "on",
        slaDueAt: new Date(Date.now() + cat.slaHours * 3_600_000),
        duplicateOfId: dup?.id ?? null,
      },
    });
    await tx.statusHistory.create({
      data: { issueId: created.id, toStatus: "SUBMITTED", changedById: user.id, note: dup ? "Linked as duplicate" : null },
    });
        if (images.length) {
      await tx.issueImage.createMany({ data: images.map((url) => ({ issueId: created.id, url })) });
    }


    if (dup) await tx.issue.update({ where: { id: dup.id }, data: { upvoteCount: { increment: 1 } } });
    const dept = await tx.department.findUnique({ where: { id: cat.departmentId } });
    if (dept?.managerId) {
      await tx.notification.create({ data: { userId: dept.managerId, type: "NEW_ISSUE", message: created.title, issueId: created.id } });
    }
    await tx.auditLog.create({ data: { userId: user.id, action: "CREATE", entity: "Issue", entityId: created.id } });
    return created;
  });

  redirect(`/issues/${issue.id}`);
}

// কোন রোল কোন স্ট্যাটাস থেকে কোথায় যেতে পারে
const MANAGER_FLOW: Partial<Record<IssueStatus, IssueStatus[]>> = {
  SUBMITTED: ["UNDER_REVIEW"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
};
const STAFF_FLOW: Partial<Record<IssueStatus, IssueStatus[]>> = {
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
};

// ---------- ২. স্ট্যাটাস বদল (ম্যানেজার/অ্যাডমিন/কর্মী) ----------
export async function updateStatusAction(fd: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "STAFF");
  const id = String(fd.get("issueId") ?? "");
  const to = String(fd.get("to") ?? "") as IssueStatus;

  const issue = await db.issue.findUnique({ where: { id }, include: { tasks: true } });
  if (!issue) return;

  let allowed = false;
  if (user.role === "ADMIN") allowed = MANAGER_FLOW[issue.status]?.includes(to) ?? false;
  if (user.role === "MANAGER")
    allowed = issue.departmentId === user.departmentId && (MANAGER_FLOW[issue.status]?.includes(to) ?? false);
  if (user.role === "STAFF")
    allowed = issue.tasks.some((t) => t.assigneeId === user.id) && (STAFF_FLOW[issue.status]?.includes(to) ?? false);
  if (!allowed) return;

  await db.$transaction(async (tx) => {
    await tx.issue.update({
      where: { id },
      data: { status: to, resolvedAt: to === "RESOLVED" ? new Date() : to === "IN_PROGRESS" ? null : undefined },
    });
    await tx.statusHistory.create({
      data: { issueId: id, fromStatus: issue.status, toStatus: to, changedById: user.id },
    });
    if (user.role === "STAFF" && to === "RESOLVED") {
      await tx.task.updateMany({ where: { issueId: id, assigneeId: user.id }, data: { status: "COMPLETED", completedAt: new Date() } });
    }
    if (user.role === "STAFF" && to === "IN_PROGRESS") {
      await tx.task.updateMany({ where: { issueId: id, assigneeId: user.id }, data: { status: "IN_PROGRESS" } });
    }
    if (to === "IN_PROGRESS" && issue.status === "RESOLVED") {
      await tx.task.updateMany({ where: { issueId: id }, data: { status: "IN_PROGRESS", completedAt: null } });
    }
    await tx.notification.create({ data: { userId: issue.reporterId, type: "STATUS", message: to, issueId: id } });
    await tx.auditLog.create({ data: { userId: user.id, action: `STATUS_${to}`, entity: "Issue", entityId: id } });
  });

  revalidatePath(`/issues/${id}`);
  revalidatePath("/issues");
}

// ---------- ৩. ম্যানেজার কর্মী অ্যাসাইন করে ----------
export async function assignAction(fd: FormData) {
  const user = await requireRole("ADMIN", "MANAGER");
  const id = String(fd.get("issueId") ?? "");
  const staffId = String(fd.get("staffId") ?? "");

  const issue = await db.issue.findUnique({ where: { id } });
  if (!issue || issue.status !== "UNDER_REVIEW") return;
  if (user.role === "MANAGER" && issue.departmentId !== user.departmentId) return;

  const staff = await db.user.findFirst({
    where: { id: staffId, role: "STAFF", isActive: true, departmentId: issue.departmentId },
  });
  if (!staff) return;

  await db.$transaction(async (tx) => {
    await tx.task.create({ data: { issueId: id, assigneeId: staff.id, assignerId: user.id, deadline: issue.slaDueAt } });
    await tx.issue.update({ where: { id }, data: { status: "ASSIGNED" } });
    await tx.statusHistory.create({
      data: { issueId: id, fromStatus: "UNDER_REVIEW", toStatus: "ASSIGNED", changedById: user.id, note: staff.name },
    });
    await tx.notification.create({ data: { userId: staff.id, type: "TASK", message: issue.title, issueId: id } });
    await tx.notification.create({ data: { userId: issue.reporterId, type: "STATUS", message: "ASSIGNED", issueId: id } });
    await tx.auditLog.create({ data: { userId: user.id, action: "ASSIGN", entity: "Issue", entityId: id, meta: { staffId: staff.id } } });
  });

  revalidatePath(`/issues/${id}`);
  revalidatePath("/issues");
}

// ---------- ৪. নাগরিক রেটিং দেয় ----------
export async function feedbackAction(fd: FormData) {
  const user = await requireRole("CITIZEN");
  const id = String(fd.get("issueId") ?? "");
  const rating = Number(fd.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;

  const issue = await db.issue.findUnique({ where: { id } });
  if (!issue || issue.reporterId !== user.id) return;
  if (issue.status !== "RESOLVED" && issue.status !== "CLOSED") return;

  await db.feedback.upsert({
    where: { issueId_userId: { issueId: id, userId: user.id } },
    update: { rating },
    create: { issueId: id, userId: user.id, rating },
  });
  revalidatePath(`/issues/${id}`);
}