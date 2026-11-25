import { Suspense } from "react";
import IssuesList from "@/components/issues-list";

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 300 }} /></div>}>
      <IssuesList searchParams={searchParams} />
    </Suspense>
  );
}