import { Suspense } from "react";
import DeptsList from "@/components/depts-list";

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 400 }} /></div>}>
      <DeptsList />
    </Suspense>
  );
}