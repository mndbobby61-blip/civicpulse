import { Suspense } from "react";
import IssueNew from "@/components/issue-new";

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 500 }} /></div>}>
      <IssueNew />
    </Suspense>
  );
}