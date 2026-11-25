import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import AppShell from "./app-shell";
import UsersView from "./users-view";
import type { Prisma, Role } from "@/generated/prisma/client";

const PAGE = 10;
const ROLES = ["ADMIN", "MANAGER", "STAFF", "CITIZEN"];

export default async function UsersList({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; page?: string }> }) {
  const sp = await searchParams;
  const admin = await requireRole("ADMIN");
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim().slice(0, 80);
  const role = ROLES.includes(sp.role ?? "") ? (sp.role as Role) : undefined;

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [total, users, depts] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({ where, orderBy: [{ role: "asc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE, take: PAGE }),
    db.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, nameBn: true } }),
  ]);

  return (
    <AppShell role={admin.role}>
      <UsersView
        total={total} page={page} pages={Math.max(1, Math.ceil(total / PAGE))} q={q} role={role ?? ""} depts={depts}
        rows={users.map((u) => ({
          id: u.id, name: u.name, email: u.email, role: u.role,
          departmentId: u.departmentId, isActive: u.isActive, isSelf: u.id === admin.id,
        }))}
      />
    </AppShell>
  );
}