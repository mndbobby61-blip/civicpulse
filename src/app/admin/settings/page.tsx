import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import AppShell from "@/components/app-shell";
import AdminSettingsView from "@/components/admin-settings-view";

async function SettingsData() {
  const admin = await requireRole("ADMIN");
  const rows = await db.setting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));

  return (
    <AppShell role={admin.role}>
      <AdminSettingsView
        initial={{
          duplicateRadiusM: map.get("duplicateRadiusM") ?? "50",
          maxImages: map.get("maxImages") ?? "3",
          bannerBn: map.get("bannerBn") ?? "",
          bannerEn: map.get("bannerEn") ?? "",
        }}
      />
    </AppShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 360 }} /></div>}>
      <SettingsData />
    </Suspense>
  );
}
