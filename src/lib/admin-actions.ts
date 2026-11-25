"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { requireRole } from "./permissions";
import type { Role } from "@/generated/prisma/client";

const ROLES = ["ADMIN", "MANAGER", "STAFF", "CITIZEN"] as const;

export async function updateUserAction(fd: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(fd.get("id") ?? "");
  const role = String(fd.get("role") ?? "") as Role;
  const departmentId = String(fd.get("departmentId") ?? "") || null;
  const isActive = fd.get("isActive") === "on";
  if (!ROLES.includes(role)) return;

  const user = await db.user.findUnique({ where: { id }, include: { managedDept: true } });
  if (!user) return;

  // নিজের রোল বা সক্রিয় অবস্থা বদলানো যাবে না (নিজেকে তালাবন্ধ করা ঠেকাতে)
  const self = user.id === admin.id;
  const newRole: Role = self ? user.role : role;
  const active = self ? true : isActive;
  const needsDept = newRole === "MANAGER" || newRole === "STAFF";
  const deptId = needsDept ? departmentId : null;
  if (needsDept && !deptId) return;

  await db.$transaction(async (tx) => {
    // আগে যে বিভাগের ম্যানেজার ছিল, সেখান থেকে সরানো
    if (user.managedDept && (newRole !== "MANAGER" || user.managedDept.id !== deptId)) {
      await tx.department.update({ where: { id: user.managedDept.id }, data: { managerId: null } });
    }
    if (newRole === "MANAGER" && deptId) {
      await tx.department.update({ where: { id: deptId }, data: { managerId: user.id } });
    }
    await tx.user.update({ where: { id }, data: { role: newRole, isActive: active, departmentId: deptId } });
    await tx.auditLog.create({
      data: { userId: admin.id, action: "UPDATE_USER", entity: "User", entityId: id, meta: { role: newRole, active, deptId } },
    });
  });
  revalidatePath("/admin/users");
}

const deptSchema = z.object({
  name: z.string().trim().min(2).max(60),
  nameBn: z.string().trim().max(60).optional(),
});

export async function createDeptAction(fd: FormData) {
  const admin = await requireRole("ADMIN");
  const p = deptSchema.safeParse({ name: fd.get("name"), nameBn: String(fd.get("nameBn") ?? "") });
  if (!p.success) return;
  if (await db.department.findUnique({ where: { name: p.data.name } })) return;
  const d = await db.department.create({ data: { name: p.data.name, nameBn: p.data.nameBn || null } });
  await db.auditLog.create({ data: { userId: admin.id, action: "CREATE", entity: "Department", entityId: d.id } });
  revalidatePath("/admin/departments");
}

export async function toggleDeptAction(fd: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(fd.get("id") ?? "");
  const d = await db.department.findUnique({ where: { id } });
  if (!d) return;
  await db.department.update({ where: { id }, data: { isActive: !d.isActive } });
  await db.auditLog.create({ data: { userId: admin.id, action: d.isActive ? "DISABLE" : "ENABLE", entity: "Department", entityId: id } });
  revalidatePath("/admin/departments");
}