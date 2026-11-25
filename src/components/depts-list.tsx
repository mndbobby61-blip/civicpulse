import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import AppShell from "./app-shell";
import DeptsView from "./depts-view";

export default async function DeptsList() {
  const admin = await requireRole("ADMIN");
  const depts = await db.department.findMany({
    orderBy: { name: "asc" },
    include: { manager: { select: { name: true } }, _count: { select: { members: true, issues: true } } },
  });
  return (
    <AppShell role={admin.role}>
      <DeptsView
        rows={depts.map((d) => ({
          id: d.id, name: d.name, nameBn: d.nameBn, isActive: d.isActive,
          manager: d.manager?.name ?? null, members: d._count.members, issues: d._count.issues,
        }))}
      />
    </AppShell>
  );
}