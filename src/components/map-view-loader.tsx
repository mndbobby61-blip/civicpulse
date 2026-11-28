"use client";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="cp-skel" style={{ height: 520 }} />,
});

export default function MapViewLoader(props: React.ComponentProps<typeof MapView>) {
  return <MapView {...props} />;
}