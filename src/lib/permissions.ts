import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import { getSession } from "./session";
import { db } from "./db";

export const HOME: Record<Role, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  STAFF: "/staff",
  CITIZEN: "/citizen",
};
export const homeFor = (r: Role) => HOME[r];

// প্রতিটা সুরক্ষিত পেজ ও API এটা দিয়ে সার্ভারে রোল চেক করবে
export async function requireRole(...roles: Role[]) {
  const s = await getSession();
  if (!s) redirect("/login");
  const user = await db.user.findUnique({ where: { id: s.uid } });
  if (!user || !user.isActive) redirect("/login");
  if (roles.length && !roles.includes(user.role)) redirect(HOME[user.role]);
  return user;
}