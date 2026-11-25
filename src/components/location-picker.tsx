"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  value: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
};

const icon = L.divIcon({
  className: "cp-mk",
  html: "<span></span>",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

export default function LocationPicker({ value, onChange }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const cb = useRef(onChange);

  useEffect(() => {
    cb.current = onChange;
  }, [onChange]);

  // ম্যাপ একবার তৈরি হয়, ফর্ম বন্ধ হলে মুছে যায়
  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current, { scrollWheelZoom: true }).setView([23.78, 90.4], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => cb.current(e.latlng.lat, e.latlng.lng));
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  // পিন বসানো বা সরানো
  useEffect(() => {
    const m = map.current;
    if (!m || !value) return;
    if (!marker.current) marker.current = L.marker(value, { icon }).addTo(m);
    else marker.current.setLatLng(value);
    m.flyTo(value, Math.max(m.getZoom(), 15), { duration: 0.6 });
  }, [value]);

  return <div ref={box} className="cp-pick" />;
}