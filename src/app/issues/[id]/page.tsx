import { Suspense } from "react";
import IssueDetail from "@/components/issue-detail";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 400 }} /></div>}>
      <IssueDetail params={params} />
    </Suspense>
  );
}