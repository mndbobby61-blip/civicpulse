import { Suspense } from "react";
import NotifList from "@/components/notif-list";

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 300 }} /></div>}>
      <NotifList />
    </Suspense>
  );
}