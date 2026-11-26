import { db } from "@/lib/db";

const H = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  const n = Number(new URL(req.url).searchParams.get("code"));
  if (!Number.isInteger(n) || n < 1 || n > 2_000_000_000) {
    return Response.json({ found: false }, { status: 400, headers: H });
  }
  // নাম, ইমেইল বা কর্মীর তথ্য কিছুই পাঠানো হয় না, শুধু শিরোনাম, অবস্থা ও সময়
  const i = await db.issue.findUnique({
    where: { seq: n },
    select: {
      title: true, status: true, areaName: true,
      category: { select: { name: true, nameBn: true } },
      history: { orderBy: { createdAt: "asc" }, select: { toStatus: true, createdAt: true } },
    },
  });
  if (!i) return Response.json({ found: false }, { headers: H });
  return Response.json(
    {
      found: true,
      title: i.title,
      status: i.status,
      cat: i.category.name,
      catBn: i.category.nameBn,
      area: i.areaName,
      history: i.history.map((h) => ({ to: h.toStatus, at: h.createdAt.toISOString() })),
    },
    { headers: H }
  );
}