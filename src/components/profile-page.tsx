import { requireRole } from "@/lib/permissions";
import AppShell from "./app-shell";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await requireRole();
  return (
    <AppShell role={user.role}>
      <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} />
    </AppShell>
  );
}