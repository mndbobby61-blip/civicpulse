"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.divIcon({ className: "cp-mk", html: "<span></span>", iconSize: [34, 34], iconAnchor: [17, 34] });

function Clicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}
function Fly({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [pos, map]);
  return null;
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={value ?? [23.78, 90.4]} zoom={12} className="cp-pick" scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Clicker onPick={onChange} />
      {value && <Marker position={value} icon={icon} />}
      <Fly pos={value} />
    </MapContainer>
  );
}