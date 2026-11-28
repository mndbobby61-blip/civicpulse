"use client";
import dynamic from "next/dynamic";
import type { Area3DNode } from "./city-3d-twin";

// ssr:false শুধু Client Component-এ ব্যবহার করা যায়
// Canvas/requestAnimationFrame server-এ নেই তাই এভাবেই load করতে হয়
const City3DTwinInner = dynamic(() => import("./city-3d-twin"), {
  ssr: false,
  loading: () => (
    <div className="cp-3d-shell" style={{ height: 540, display: "flex", alignItems: "center", justifyContent: "center", color: "#2de2c4", fontSize: 16, fontWeight: 600 }}>
      ⬡ 3D City Twin লোড হচ্ছে...
    </div>
  ),
});

export default function City3DClientWrapper({ areas, height }: { areas: Area3DNode[]; height?: number }) {
  return <City3DTwinInner areas={areas} height={height} />;
}
