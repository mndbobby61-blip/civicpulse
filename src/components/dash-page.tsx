import { Suspense } from "react";
import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import DashHome from "./dash-home";
import type { Role } from "@/generated/prisma/client";

async function DashData({ role }: { role: Role }) {
  const user = await requireRole(role);
  const base = role === "CITIZEN" ? { reporterId: user.id } : {};
  const [total, open, resolved] = await Promise.all([
    db.issue.count({ where: base }),
    db.issue.count({ where: { ...base, status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    db.issue.count({ where: { ...base, status: { in: ["RESOLVED", "CLOSED"] } } }),
  ]);
  return <DashHome name={user.name} role={user.role} stats={{ total, open, resolved }} />;
}

export default function DashPage({ role }: { role: Role }) {
  return (
    <Suspense
      fallback={
        <main className="cp-wrap cp-dash" aria-busy="true">
          <div className="cp-skel" style={{ height: 56, width: "60%" }} />
          <div className="cp-skel" style={{ height: 120, marginTop: 40 }} />
        </main>
      }
    >
      <DashData role={role} />
    </Suspense>
  );
}