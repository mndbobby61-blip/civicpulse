import { Suspense } from "react";
import LeaderboardPage from "@/components/leaderboard-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 400 }} /></div>}>
      <LeaderboardPage />
    </Suspense>
  );
}