import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const H = { "Cache-Control": "no-store" };

export async function GET() {
  const s = await getSession();
  if (!s) return Response.json({ items: [] }, { status: 401, headers: H });
  const rows = await db.notification.findMany({
    where: { userId: s.uid },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json(
    {
      items: rows.map((n) => ({
        id: n.id, type: n.type, message: n.message, issueId: n.issueId,
        isRead: n.isRead, at: n.createdAt.toISOString(),
      })),
    },
    { headers: H }
  );
}

// ids দিলে শুধু সেগুলো, না দিলে সব "পড়া হয়েছে" হয়। শুধু নিজের নোটিফিকেশন বদলানো যায়।
export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return Response.json({ ok: false }, { status: 401, headers: H });
  let ids: string[] | undefined;
  try {
    const b = await req.json();
    if (Array.isArray(b.ids)) ids = b.ids.filter((x: unknown) => typeof x === "string").slice(0, 100);
  } catch {}
  await db.notification.updateMany({
    where: { userId: s.uid, isRead: false, ...(ids ? { id: { in: ids } } : {}) },
    data: { isRead: true },
  });
  return Response.json({ ok: true }, { headers: H });
}