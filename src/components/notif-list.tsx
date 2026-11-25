import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import AppShell from "./app-shell";
import NotifView from "./notif-view";

export default async function NotifList() {
  const user = await requireRole();
  const rows = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <AppShell role={user.role}>
      <NotifView
        rows={rows.map((n) => ({
          id: n.id, type: n.type, message: n.message, issueId: n.issueId,
          isRead: n.isRead, at: n.createdAt.toISOString(),
        }))}
      />
    </AppShell>
  );
}