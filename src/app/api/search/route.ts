import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import type { IssueStatus } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return new Response("Unauthorized", { status: 401 });

  const rl = checkRateLimit(`search:${s.uid}`, 30, 60_000);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (q.length < 2) return Response.json({ results: [] });

  const user = await db.user.findUnique({ where: { id: s.uid }, select: { role: true, departmentId: true, isActive: true } });
  if (!user || !user.isActive) return new Response("Forbidden", { status: 403 });

  // Role-based scope: manager শুধু নিজ department দেখে
  const deptFilter = user.role === "MANAGER" ? { departmentId: user.departmentId ?? "none" } : {};
  // Staff শুধু assigned issues দেখে
  const staffFilter = user.role === "STAFF"
    ? { tasks: { some: { assigneeId: s.uid, status: { not: "COMPLETED" as const } } } }
    : {};

  const issues = await db.issue.findMany({
    where: {
      ...deptFilter,
      ...staffFilter,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { areaName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
        { category: { nameBn: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      seq: true,
      title: true,
      status: true,
      priority: true,
      areaName: true,
      category: { select: { name: true, nameBn: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const results = issues.map((i) => ({
    id: i.id,
    seq: i.seq,
    title: i.title,
    status: i.status as IssueStatus,
    priority: i.priority,
    area: i.areaName ?? "",
    cat: i.category.name,
    catBn: i.category.nameBn,
  }));

  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
