import { Suspense } from "react";
import MapPage from "@/components/map-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="cp-wrap cp-dash"><div className="cp-skel" style={{ height: 520 }} /></div>}>
      <MapPage />
    </Suspense>
  );
}