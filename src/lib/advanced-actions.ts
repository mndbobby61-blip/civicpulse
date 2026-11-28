"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { requireRole } from "./permissions";
import type { Priority } from "@/generated/prisma/client";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

// 1. Field Staff submits TaskReport + optional COMPLETION photos
const reportSchema = z.object({
  issueId: z.string().min(1),
  description: z.string().trim().min(5).max(1000),
});

export async function submitTaskReportAction(fd: FormData) {
  const user = await requireRole("STAFF", "ADMIN");
  const parsed = reportSchema.safeParse({
    issueId: fd.get("issueId"),
    description: fd.get("description"),
  });
  if (!parsed.success) return;

  const { issueId, description } = parsed.data;
  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });
  if (!issue) return;

  const task =
    user.role === "ADMIN"
      ? issue.tasks[0]
      : issue.tasks.find((t) => t.assigneeId === user.id);
  if (!task) return;

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  const photos = cloud
    ? fd
        .getAll("completionPhotos")
        .map(String)
        .filter((u) => u.startsWith(`https://res.cloudinary.com/${cloud}/`))
        .slice(0, 3)
    : [];

  await db.$transaction(async (tx) => {
    await tx.taskReport.create({
      data: {
        taskId: task.id,
        description,
        photos,
      },
    });
    if (photos.length > 0) {
      await tx.issueImage.createMany({
        data: photos.map((url) => ({
          issueId: issue.id,
          url,
          type: "COMPLETION",
        })),
      });
    }
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "TASK_REPORT",
        entity: "Issue",
        entityId: issue.id,
        meta: { taskId: task.id, photoCount: photos.length },
      },
    });
  });

  revalidatePath(`/issues/${issue.id}`);
}

// 2. Citizen writes review comment alongside rating
const reviewSchema = z.object({
  issueId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export async function saveFeedbackReviewAction(fd: FormData) {
  const user = await requireRole("CITIZEN");
  const parsed = reviewSchema.safeParse({
    issueId: fd.get("issueId"),
    rating: fd.get("rating"),
    comment: fd.get("comment") ? String(fd.get("comment")) : undefined,
  });
  if (!parsed.success) return;

  const issue = await db.issue.findUnique({ where: { id: parsed.data.issueId } });
  if (!issue || issue.reporterId !== user.id) return;
  if (issue.status !== "RESOLVED" && issue.status !== "CLOSED") return;

  await db.feedback.upsert({
    where: { issueId_userId: { issueId: issue.id, userId: user.id } },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
    create: {
      issueId: issue.id,
      userId: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  revalidatePath(`/issues/${issue.id}`);
}

// 3. Manager / Admin Priority Override & Department/Category Re-routing
export async function managerTriageAction(fd: FormData) {
  const user = await requireRole("ADMIN", "MANAGER");
  const issueId = String(fd.get("issueId") ?? "");
  const priority = String(fd.get("priority") ?? "") as Priority;
  const categoryId = String(fd.get("categoryId") ?? "");
  const note = String(fd.get("note") ?? "").trim().slice(0, 200);

  if (!PRIORITIES.includes(priority) || !issueId) return;

  const issue = await db.issue.findUnique({ where: { id: issueId } });
  if (!issue) return;
  if (user.role === "MANAGER" && issue.departmentId !== user.departmentId) return;

  const nextCat = categoryId
    ? await db.category.findUnique({ where: { id: categoryId } })
    : null;

  await db.$transaction(async (tx) => {
    await tx.issue.update({
      where: { id: issueId },
      data: {
        priority,
        ...(nextCat
          ? {
              categoryId: nextCat.id,
              departmentId: nextCat.departmentId,
              slaDueAt: new Date(issue.createdAt.getTime() + nextCat.slaHours * 3_600_000),
            }
          : {}),
      },
    });
    await tx.statusHistory.create({
      data: {
        issueId,
        fromStatus: issue.status,
        toStatus: issue.status,
        changedById: user.id,
        note: note || `Triage: ${priority}${nextCat && nextCat.id !== issue.categoryId ? ` · ${nextCat.name}` : ""}`,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "TRIAGE_UPDATE",
        entity: "Issue",
        entityId: issueId,
        meta: { priority, categoryId: nextCat?.id ?? issue.categoryId },
      },
    });
  });

  revalidatePath(`/issues/${issueId}`);
  revalidatePath("/issues");
}

// 4. Internal Team Notes (stored safely in AuditLog with entity="InternalNote", zero schema changes)
const noteSchema = z.object({
  issueId: z.string().min(1),
  text: z.string().trim().min(2).max(500),
});

export async function saveInternalNoteAction(fd: FormData) {
  const user = await requireRole("ADMIN", "MANAGER", "STAFF");
  const parsed = noteSchema.safeParse({
    issueId: fd.get("issueId"),
    text: fd.get("text"),
  });
  if (!parsed.success) return;

  const issue = await db.issue.findUnique({
    where: { id: parsed.data.issueId },
    include: { tasks: { select: { assigneeId: true } } },
  });
  if (!issue) return;

  const allowed =
    user.role === "ADMIN" ||
    (user.role === "MANAGER" && issue.departmentId === user.departmentId) ||
    (user.role === "STAFF" && issue.tasks.some((t) => t.assigneeId === user.id));
  if (!allowed) return;

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "INTERNAL_NOTE",
      entity: "InternalNote",
      entityId: issue.id,
      meta: {
        text: parsed.data.text,
        authorName: user.name,
        authorRole: user.role,
      },
    },
  });

  revalidatePath(`/issues/${issue.id}`);
}

// 5. Admin Category & SLA Management
const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  nameBn: z.string().trim().max(60).optional(),
  icon: z.string().trim().max(24).optional(),
  slaHours: z.coerce.number().int().min(1).max(720),
  departmentId: z.string().min(1),
});

export async function createCategoryAction(fd: FormData) {
  const admin = await requireRole("ADMIN");
  const parsed = categorySchema.safeParse({
    name: fd.get("name"),
    nameBn: fd.get("nameBn") ? String(fd.get("nameBn")) : undefined,
    icon: fd.get("icon") ? String(fd.get("icon")) : undefined,
    slaHours: fd.get("slaHours"),
    departmentId: fd.get("departmentId"),
  });
  if (!parsed.success) return;

  const exists = await db.category.findUnique({ where: { name: parsed.data.name } });
  if (exists) return;

  const created = await db.category.create({
    data: {
      name: parsed.data.name,
      nameBn: parsed.data.nameBn || null,
      icon: parsed.data.icon || "build",
      slaHours: parsed.data.slaHours,
      departmentId: parsed.data.departmentId,
    },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE_CATEGORY",
      entity: "Department",
      entityId: created.departmentId,
      meta: { categoryId: created.id, name: created.name, slaHours: created.slaHours },
    },
  });

  revalidatePath("/admin/categories");
}

export async function updateCategorySlaAction(fd: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(fd.get("id") ?? "");
  const slaHours = Number(fd.get("slaHours"));
  if (!id || !Number.isInteger(slaHours) || slaHours < 1 || slaHours > 720) return;

  await db.category.update({ where: { id }, data: { slaHours } });
  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "UPDATE_SLA",
      entity: "Department",
      entityId: id,
      meta: { slaHours },
    },
  });
  revalidatePath("/admin/categories");
}

// 6. Admin System Settings (using existing Setting key-value table)
const settingsSchema = z.object({
  duplicateRadiusM: z.coerce.number().int().min(10).max(500),
  maxImages: z.coerce.number().int().min(1).max(6),
  bannerBn: z.string().trim().max(240),
  bannerEn: z.string().trim().max(240),
});

export async function saveSettingsAction(fd: FormData) {
  const admin = await requireRole("ADMIN");
  const parsed = settingsSchema.safeParse({
    duplicateRadiusM: fd.get("duplicateRadiusM"),
    maxImages: fd.get("maxImages"),
    bannerBn: String(fd.get("bannerBn") ?? ""),
    bannerEn: String(fd.get("bannerEn") ?? ""),
  });
  if (!parsed.success) return;

  const entries: [string, string][] = [
    ["duplicateRadiusM", String(parsed.data.duplicateRadiusM)],
    ["maxImages", String(parsed.data.maxImages)],
    ["bannerBn", parsed.data.bannerBn],
    ["bannerEn", parsed.data.bannerEn],
  ];

  await db.$transaction(async (tx) => {
    for (const [key, value] of entries) {
      await tx.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE_SETTINGS",
        entity: "Department",
        meta: Object.fromEntries(entries),
      },
    });
  });

  revalidatePath("/admin/settings");
}
