import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import DashHome from "./dash-home";
import type { Role } from "@/generated/prisma/client";

export default async function DashPage({ role }: { role: Role }) {
  const user = await requireRole(role);
  const base = role === "CITIZEN" ? { reporterId: user.id } : {};
  const [total, open, resolved] = await Promise.all([
    db.issue.count({ where: base }),
    db.issue.count({ where: { ...base, status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    db.issue.count({ where: { ...base, status: { in: ["RESOLVED", "CLOSED"] } } }),
  ]);
  return <DashHome name={user.name} role={user.role} stats={{ total, open, resolved }} />;
}