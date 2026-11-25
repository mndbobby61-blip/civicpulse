import { db } from "@/lib/db";
import { requireRole, homeFor } from "@/lib/permissions";
import AppShell from "./app-shell";
import IssueForm from "./issue-form";

export default async function IssueNew() {
  const user = await requireRole("CITIZEN");
  const cats = await db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, nameBn: true } });
  return (
    <AppShell role={user.role} home={homeFor(user.role)}>
      <IssueForm cats={cats} />
    </AppShell>
  );
}