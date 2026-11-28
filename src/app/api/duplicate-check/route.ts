import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const HEADERS = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return Response.json({ match: null }, { status: 401, headers: HEADERS });

  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId") ?? "";
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));

  if (!categoryId || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ match: null }, { headers: HEADERS });
  }

  const delta = 0.00045;
  const dup = await db.issue.findFirst({
    where: {
      categoryId,
      duplicateOfId: null,
      status: { notIn: ["RESOLVED", "CLOSED"] },
      lat: { gte: lat - delta, lte: lat + delta },
      lng: { gte: lng - delta, lte: lng + delta },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, seq: true, title: true, upvoteCount: true, address: true },
  });

  return Response.json({ match: dup }, { headers: HEADERS });
}
