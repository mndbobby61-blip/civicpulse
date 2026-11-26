"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "./db";
import { createSession, destroySession } from "./session";
import { homeFor } from "./permissions";

export type AuthState = { error?: "invalid" | "exists" | "fields" | "weak"; to?: string };

const email = z.string().trim().toLowerCase().email();

// শুধু নিজের সাইটের ভেতরের পথ গ্রহণ করা হয়, বাইরের লিংকে পাঠানো ঠেকাতে
function safeNext(v: FormDataEntryValue | null) {
  const s = String(v ?? "");
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : null;
}

export async function loginAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const p = z.object({ email, password: z.string().min(1) }).safeParse({
    email: fd.get("email"),
    password: fd.get("password"),
  });
  if (!p.success) return { error: "fields" };

  const user = await db.user.findUnique({ where: { email: p.data.email } });
  const ok = user && user.isActive && (await bcrypt.compare(p.data.password, user.passwordHash));
  if (!user || !ok) return { error: "invalid" };

  await createSession({ uid: user.id, role: user.role, name: user.name });
  return { to: safeNext(fd.get("next")) ?? homeFor(user.role) };
}

export async function registerAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "weak" };

  const p = z.object({ name: z.string().trim().min(2).max(80), email }).safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
  });
  if (!p.success) return { error: "fields" };

  if (await db.user.findUnique({ where: { email: p.data.email } })) return { error: "exists" };

  // রোল সবসময় CITIZEN, ফর্ম থেকে রোল নেওয়া হয় না
  const user = await db.user.create({
    data: { name: p.data.name, email: p.data.email, passwordHash: await bcrypt.hash(password, 10), role: "CITIZEN" },
  });
  await createSession({ uid: user.id, role: user.role, name: user.name });
  return { to: safeNext(fd.get("next")) ?? "/citizen" };
}

export async function logoutAction() {
  await destroySession();
}