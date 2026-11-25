"use server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "./db";
import { requireRole } from "./permissions";
import { createSession } from "./session";

export async function markAllReadAction() {
  const user = await requireRole();
  await db.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  revalidatePath("/notifications");
}

export type ProfileState = { ok?: boolean; error?: "fields" | "wrong" | "weak" };

export async function updateProfileAction(_: ProfileState, fd: FormData): Promise<ProfileState> {
  const user = await requireRole();
  const p = z
    .object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().max(30) })
    .safeParse({ name: fd.get("name"), phone: String(fd.get("phone") ?? "") });
  if (!p.success) return { error: "fields" };

  const curPass = String(fd.get("curPass") ?? "");
  const newPass = String(fd.get("newPass") ?? "");
  let passwordHash: string | undefined;
  if (newPass) {
    if (newPass.length < 8) return { error: "weak" };
    if (!(await bcrypt.compare(curPass, user.passwordHash))) return { error: "wrong" };
    passwordHash = await bcrypt.hash(newPass, 10);
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: p.data.name, phone: p.data.phone || null, ...(passwordHash ? { passwordHash } : {}) },
  });
  await createSession({ uid: user.id, role: user.role, name: p.data.name });
  revalidatePath("/profile");
  return { ok: true };
}