import { db } from "@/lib/db";

/**
 * Escalates open issues overdue by more than 24 hours to all active Admins
 * and optionally notifies an external webhook (email/SMS/Slack bridge via ALERT_WEBHOOK_URL).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 3_600_000);
  const [overdue, admins] = await Promise.all([
    db.issue.findMany({
      where: { status: { notIn: ["RESOLVED", "CLOSED"] }, slaDueAt: { lt: cutoff } },
      select: { id: true, seq: true, title: true },
      take: 300,
    }),
    db.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    }),
  ]);

  if (!overdue.length || !admins.length) {
    return Response.json({ checked: overdue.length, escalated: 0, webhookSent: false });
  }

  const existing = await db.notification.findMany({
    where: {
      type: "SLA_ESCALATION",
      issueId: { in: overdue.map((i) => i.id) },
    },
    select: { userId: true, issueId: true },
  });
  const seen = new Set(existing.map((e) => `${e.userId}:${e.issueId}`));

  const toCreate: { userId: string; type: string; message: string; issueId: string }[] = [];
  for (const issue of overdue) {
    for (const admin of admins) {
      if (!seen.has(`${admin.id}:${issue.id}`)) {
        toCreate.push({
          userId: admin.id,
          type: "SLA_ESCALATION",
          message: `24h+ SLA Escalation: ${issue.title}`,
          issueId: issue.id,
        });
      }
    }
  }

  if (toCreate.length) await db.notification.createMany({ data: toCreate });

  let webhookSent = false;
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl && toCreate.length > 0) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "SLA_ESCALATION",
          count: overdue.length,
          issues: overdue.slice(0, 10).map((i) => ({ seq: i.seq, title: i.title })),
        }),
        signal: AbortSignal.timeout(5000),
      });
      webhookSent = res.ok;
    } catch {
      webhookSent = false;
    }
  }

  return Response.json({ checked: overdue.length, escalated: toCreate.length, webhookSent });
}
