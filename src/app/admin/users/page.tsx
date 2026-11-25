import { Suspense } from "react";
import UsersList from "@/components/users-list";

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; page?: string }> }) {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 400 }} /></div>}>
      <UsersList searchParams={searchParams} />
    </Suspense>
  );
}