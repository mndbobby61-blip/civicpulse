import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { loadScores, toProgress } from "@/lib/gamify";
import AppShell from "./app-shell";
import LeaderboardView from "./leaderboard-view";

export default async function LeaderboardPage() {
  const user = await requireRole();
  const [scores, citizens] = await Promise.all([
    loadScores(),
    db.user.findMany({ where: { role: "CITIZEN", isActive: true }, select: { id: true, name: true } }),
  ]);
  const ranked = citizens
    .map((c) => ({ id: c.id, name: c.name, p: toProgress(scores.get(c.id)) }))
    .filter((x) => x.p.points > 0 || x.id === user.id)
    .sort((a, b) => b.p.points - a.p.points);
  const idx = ranked.findIndex((r) => r.id === user.id);

  return (
    <AppShell role={user.role}>
      <LeaderboardView
        rows={ranked.slice(0, 10).map((r, i) => ({
          rank: i + 1, name: r.name, points: r.p.points, levelKey: r.p.levelKey, isMe: r.id === user.id,
        }))}
        me={user.role === "CITIZEN" ? { progress: toProgress(scores.get(user.id)), rank: idx >= 0 ? idx + 1 : null } : null}
      />
    </AppShell>
  );
}