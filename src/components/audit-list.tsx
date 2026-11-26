import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import AppShell from "./app-shell";
import AuditView from "./audit-view";

const PAGE = 20;

export default async function AuditList({ searchParams }: { searchParams: Promise<{ entity?: string; page?: string }> }) {
  const sp = await searchParams;
  const admin = await requireRole("ADMIN");
  const page = Math.max(1, Number(sp.page) || 1);
  const entity = ["Issue", "User", "Department"].includes(sp.entity ?? "") ? (sp.entity as string) : "";
  const where = entity ? { entity } : {};

  const [total, rows] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
  ]);
  const ids = [...new Set(rows.map((r) => r.userId).filter((x): x is string => !!x))];
  const users = await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  const name = new Map(users.map((u) => [u.id, u.name]));

  return (
    <AppShell role={admin.role}>
      <AuditView
        total={total}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE))}
        entity={entity}
        rows={rows.map((r) => ({
          id: r.id, action: r.action, entity: r.entity, entityId: r.entityId,
          by: r.userId ? name.get(r.userId) ?? null : null,
          at: r.createdAt.toISOString(),
          meta: r.meta ? JSON.stringify(r.meta).slice(0, 90) : "",
        }))}
      />
    </AppShell>
  );
}