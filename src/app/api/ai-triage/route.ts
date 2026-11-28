import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { classifyIssue } from "@/lib/ai-triage";

const HEADERS = { "Cache-Control": "no-store" };

const bodySchema = z.object({
  title: z.string().trim().max(160).default(""),
  description: z.string().trim().max(2000).default(""),
  imageUrl: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return Response.json({ error: "Unauthorized" }, { status: 401, headers: HEADERS });

  const rl = checkRateLimit(`ai:${s.uid}`, 15, 60_000);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429, headers: HEADERS });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers: HEADERS });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Invalid fields" }, { status: 400, headers: HEADERS });
  if (!parsed.data.title && !parsed.data.description && !parsed.data.imageUrl) {
    return Response.json({ error: "Provide title, description, or photo" }, { status: 400, headers: HEADERS });
  }

  const cats = await db.category.findMany({
    select: { id: true, name: true, nameBn: true },
    orderBy: { name: "asc" },
  });

  const result = await classifyIssue(
    parsed.data.title,
    parsed.data.description,
    cats,
    parsed.data.imageUrl
  );
  return Response.json(result, { headers: HEADERS });
}
