import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const H = { "Cache-Control": "no-store" };

export async function GET() {
  const s = await getSession();
  if (!s) return Response.json({ user: null }, { headers: H });
  const u = await db.user.findUnique({
    where: { id: s.uid },
    select: { name: true, role: true, isActive: true },
  });
  if (!u || !u.isActive) return Response.json({ user: null }, { headers: H });
  return Response.json({ user: { name: u.name, role: u.role } }, { headers: H });
}