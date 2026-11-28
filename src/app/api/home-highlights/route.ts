import { db } from "@/lib/db";

const HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

export async function GET() {
  try {
    const [settings, issues, resolvedPairs] = await Promise.all([
      db.setting.findMany({
        where: { key: { in: ["bannerBn", "bannerEn"] } },
      }),
      db.issue.findMany({
        where: { areaName: { not: null } },
        select: { areaName: true, status: true },
        take: 2500,
      }),
      db.issue.findMany({
        where: {
          images: { some: { type: "COMPLETION" } },
        },
        select: {
          id: true,
          seq: true,
          title: true,
          areaName: true,
          images: { select: { url: true, type: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
    ]);

    const sMap = new Map(settings.map((s) => [s.key, s.value]));
    const areaMap = new Map<string, { total: number; solved: number }>();

    for (const i of issues) {
      const name = i.areaName!;
      const cur = areaMap.get(name) ?? { total: 0, solved: 0 };
      cur.total += 1;
      if (i.status === "RESOLVED" || i.status === "CLOSED") cur.solved += 1;
      areaMap.set(name, cur);
    }

    const areas3d = Array.from(areaMap.entries())
      .map(([name, v]) => ({
        name,
        total: v.total,
        solved: v.solved,
        open: Math.max(0, v.total - v.solved),
        rate: v.total ? Math.round((v.solved / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    const beforeAfter = resolvedPairs.flatMap((p) => {
      const before = p.images.find((im) => im.type === "REPORT")?.url;
      const after = p.images.find((im) => im.type === "COMPLETION")?.url;
      return before && after
        ? [{ id: p.id, seq: p.seq, title: p.title, area: p.areaName, before, after }]
        : [];
    });

    return Response.json(
      {
        banner: {
          bn: sMap.get("bannerBn") ?? "",
          en: sMap.get("bannerEn") ?? "",
        },
        areas3d,
        beforeAfter,
      },
      { headers: HEADERS }
    );
  } catch {
    return Response.json(
      { banner: { bn: "", en: "" }, areas3d: [], beforeAfter: [] },
      { headers: HEADERS }
    );
  }
}
