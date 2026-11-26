import { db } from "@/lib/db";

// শুধু গোপন চাবি থাকলে চলে, নইলে ৪০১। Vercel Cron নিজেই এই চাবি পাঠায়।
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const late = await db.issue.findMany({
    where: { status: { notIn: ["RESOLVED", "CLOSED"] }, slaDueAt: { lt: new Date() } },
    select: { id: true, title: true, department: { select: { managerId: true } } },
    take: 500,
  });
  const done = await db.notification.findMany({
    where: { type: "SLA", issueId: { in: late.map((l) => l.id) } },
    select: { issueId: true, userId: true },
  });
  const seen = new Set(done.map((d) => `${d.userId}:${d.issueId}`));

  const data = late.flatMap((i) => {
    const to = i.department.managerId;
    return to && !seen.has(`${to}:${i.id}`) ? [{ userId: to, type: "SLA", message: i.title, issueId: i.id }] : [];
  });
  if (data.length) await db.notification.createMany({ data });
  return Response.json({ checked: late.length, notified: data.length });
}