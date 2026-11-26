import { Suspense } from "react";
import AuditList from "@/components/audit-list";

export default function Page({ searchParams }: { searchParams: Promise<{ entity?: string; page?: string }> }) {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 400 }} /></div>}>
      <AuditList searchParams={searchParams} />
    </Suspense>
  );
}