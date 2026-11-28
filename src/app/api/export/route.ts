import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { priorityParts } from "@/lib/priority";
import { csvCell } from "@/lib/csv-utils";
import type { IssueStatus, Prisma } from "@/generated/prisma/client";

const VALID_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return new Response("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: s.uid } });
  if (!user || !user.isActive || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    return new Response("Forbidden", { status: 403 });
  }

  const rl = checkRateLimit(`export:${user.id}`, 10, 60_000);
  if (!rl.allowed) return new Response("Too many requests", { status: 429 });

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status") ?? "";
  const statusFilter = VALID_STATUSES.includes(statusParam) ? (statusParam as IssueStatus) : undefined;
  const format = url.searchParams.get("format") ?? "csv"; // csv | json

  // Date range filter (optional)
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const fromDate = fromParam ? new Date(fromParam) : undefined;
  const toDate = toParam ? new Date(toParam + "T23:59:59Z") : undefined;
  const dateFilter: Prisma.DateTimeFilter | undefined =
    fromDate || toDate
      ? { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) }
      : undefined;

  const where: Prisma.IssueWhereInput = {
    ...(user.role === "MANAGER" ? { departmentId: user.departmentId ?? "none" } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };

  const rows = await db.issue.findMany({
    where,
    include: {
      category: { select: { name: true } },
      department: { select: { name: true } },
      reporter: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const now = Date.now();

  // JSON export
  if (format === "json") {
    const data = rows.map((r) => ({
      code: `CP-${r.seq}`,
      title: r.title,
      category: r.category.name,
      department: r.department.name,
      status: r.status,
      priority: r.priority,
      priorityScore: priorityParts(r, now).total,
      upvotes: r.upvoteCount,
      area: r.areaName ?? "",
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      reporter: r.isAnonymous ? "Anonymous" : r.reporter.name,
      createdAt: r.createdAt.toISOString(),
      slaDueAt: r.slaDueAt?.toISOString() ?? null,
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
    }));
    return new Response(JSON.stringify({ count: data.length, rows: data }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="civicpulse-issues-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // CSV export (default)
  const header = [
    "Code", "Title", "Category", "Department", "Status", "Priority",
    "PriorityScore", "Upvotes", "Area", "Address", "Reporter",
    "CreatedAt", "SLADueAt", "ResolvedAt",
  ].join(",");

  const lines = rows.map((r) =>
    [
      `CP-${r.seq}`,
      r.title,
      r.category.name,
      r.department.name,
      r.status,
      r.priority,
      priorityParts(r, now).total,
      r.upvoteCount,
      r.areaName ?? "",
      r.address,
      r.isAnonymous ? "Anonymous" : r.reporter.name,
      r.createdAt.toISOString(),
      r.slaDueAt?.toISOString() ?? "",
      r.resolvedAt?.toISOString() ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  // UTF-8 BOM ensures Bangla characters render properly in Microsoft Excel
  const body = `\uFEFF${[header, ...lines].join("\r\n")}`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="civicpulse-issues-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
