import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import AppShell from "@/components/app-shell";
import AdminCategoriesView from "@/components/admin-categories-view";

async function CategoriesData() {
  const admin = await requireRole("ADMIN");
  const [cats, depts] = await Promise.all([
    db.category.findMany({
      include: {
        department: { select: { name: true, nameBn: true } },
        _count: { select: { issues: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, nameBn: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AppShell role={admin.role}>
      <AdminCategoriesView
        depts={depts}
        rows={cats.map((c) => ({
          id: c.id,
          name: c.name,
          nameBn: c.nameBn,
          icon: c.icon,
          slaHours: c.slaHours,
          deptName: c.department.name,
          deptNameBn: c.department.nameBn,
          issueCount: c._count.issues,
        }))}
      />
    </AppShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 420 }} /></div>}>
      <CategoriesData />
    </Suspense>
  );
}
