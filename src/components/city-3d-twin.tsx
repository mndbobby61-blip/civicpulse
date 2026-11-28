"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { advT } from "@/lib/advanced-dict";

export type Area3DNode = {
  name: string;
  total: number;
  solved: number;
  open: number;
  rate: number;
};

type ProjectedTower = {
  idx: number;
  area: Area3DNode;
  cx: number;
  cy: number;
  topY: number;
  depth: number;
  radius: number;
};

const FALLBACK_AREAS: Area3DNode[] = [
  { name: "Mirpur 10", total: 22, solved: 14, open: 8, rate: 64 },
  { name: "Dhanmondi 27", total: 18, solved: 13, open: 5, rate: 72 },
  { name: "Uttara 4", total: 16, solved: 11, open: 5, rate: 69 },
  { name: "Gulshan 2", total: 14, solved: 12, open: 2, rate: 86 },
  { name: "Mohammadpur", total: 19, solved: 10, open: 9, rate: 53 },
  { name: "Motijheel", total: 15, solved: 9, open: 6, rate: 60 },
  { name: "Banani", total: 12, solved: 10, open: 2, rate: 83 },
  { name: "Badda", total: 17, solved: 8, open: 9, rate: 47 },
  { name: "Tejgaon", total: 13, solved: 9, open: 4, rate: 69 },
];

export default function City3DTwin({
  areas,
  height = 430,
}: {
  areas: Area3DNode[];
  height?: number;
}) {
  const { lang } = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const towersRef = useRef<ProjectedTower[]>([]);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });
  const rotRef = useRef<{ yaw: number; pitch: number; zoom: number; auto: boolean }>({
    yaw: 0.65,
    pitch: 0.56,
    zoom: 1,
    auto: true,
  });

  const [autoRotate, setAutoRotate] = useState(true);
  const [selected, setSelected] = useState<Area3DNode | null>(null);

  const nodes = areas.length > 0 ? areas : FALLBACK_AREAS;

  useEffect(() => {
    rotRef.current.auto = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let time = 0;

    const maxTotal = Math.max(1, ...nodes.map((n) => n.total));
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    const spacing = 1.35;

    function project(x: number, y: number, z: number, w: number, h: number) {
      const { yaw, pitch, zoom } = rotRef.current;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      const camDist = 9.5 / zoom;
      const scale = (Math.min(w, h) * 0.72) / (camDist + z2);
      return {
        sx: w / 2 + x1 * scale,
        sy: h * 0.58 - y2 * scale,
        depth: z2,
        scale,
      };
    }

    function drawPrism(
      cx: number,
      cz: number,
      baseY: number,
      h3d: number,
      halfW: number,
      w: number,
      h: number,
      topColor: string,
      sideColorA: string,
      sideColorB: string
    ) {
      if (!ctx) return null;
      const corners = [
        [-halfW, -halfW],
        [halfW, -halfW],
        [halfW, halfW],
        [-halfW, halfW],
      ];
      const bot = corners.map(([dx, dz]) => project(cx + dx, baseY, cz + dz, w, h));
      const top = corners.map(([dx, dz]) => project(cx + dx, baseY + h3d, cz + dz, w, h));

      const faces = [0, 1, 2, 3].map((i) => {
        const j = (i + 1) % 4;
        const avgD = (bot[i].depth + bot[j].depth + top[i].depth + top[j].depth) / 4;
        return { i, j, avgD };
      });
      faces.sort((a, b) => b.avgD - a.avgD);

      for (const f of faces) {
        const { i, j } = f;
        ctx.beginPath();
        ctx.moveTo(bot[i].sx, bot[i].sy);
        ctx.lineTo(bot[j].sx, bot[j].sy);
        ctx.lineTo(top[j].sx, top[j].sy);
        ctx.lineTo(top[i].sx, top[i].sy);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? sideColorA : sideColorB;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(top[0].sx, top[0].sy);
      for (let k = 1; k < 4; k += 1) ctx.lineTo(top[k].sx, top[k].sy);
      ctx.closePath();
      ctx.fillStyle = topColor;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();

      const centerTop = project(cx, baseY + h3d, cz, w, h);
      const centerBot = project(cx, baseY, cz, w, h);
      return { centerTop, centerBot };
    }

    function render() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(300, rect.width);
      const h = Math.max(260, rect.height);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (rotRef.current.auto && !dragRef.current.active) {
        rotRef.current.yaw += 0.0035;
      }
      time += 0.03;

      ctx.clearRect(0, 0, w, h);

      // Draw 3D perspective city grid
      const gridHalf = (Math.max(cols, rows) * spacing) / 2 + 0.8;
      ctx.strokeStyle = "rgba(45, 226, 196, 0.16)";
      ctx.lineWidth = 1;
      for (let g = -3; g <= 3; g += 1) {
        const offset = (g / 3) * gridHalf;
        const p1 = project(-gridHalf, 0, offset, w, h);
        const p2 = project(gridHalf, 0, offset, w, h);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();

        const q1 = project(offset, 0, -gridHalf, w, h);
        const q2 = project(offset, 0, gridHalf, w, h);
        ctx.beginPath();
        ctx.moveTo(q1.sx, q1.sy);
        ctx.lineTo(q2.sx, q2.sy);
        ctx.stroke();
      }

      // Compute 3D positions & sort back-to-front (painter's algorithm)
      const items = nodes.map((area, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = (col - (cols - 1) / 2) * spacing;
        const cz = (row - (rows - 1) / 2) * spacing;
        const p = project(cx, 0, cz, w, h);
        return { idx, area, cx, cz, depth: p.depth };
      });
      items.sort((a, b) => b.depth - a.depth);

      const projectedList: ProjectedTower[] = [];

      for (const item of items) {
        const totalH = 0.45 + (item.area.total / maxTotal) * 2.4;
        const solvedRatio = item.area.total ? item.area.solved / item.area.total : 0;
        const solvedH = totalH * solvedRatio;
        const openH = Math.max(0.05, totalH - solvedH);

        // Pulse ring on ground for open issues
        if (item.area.open > 0) {
          const gp = project(item.cx, 0.01, item.cz, w, h);
          const pulse = ((time + item.idx * 0.7) % 2) / 2;
          ctx.beginPath();
          ctx.ellipse(
            gp.sx,
            gp.sy,
            (10 + pulse * 22) * (gp.scale / 55),
            (5 + pulse * 11) * (gp.scale / 55),
            0,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `rgba(255, 185, 56, ${(1 - pulse) * 0.55})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Solved bottom segment (Teal/Emerald)
        if (solvedH > 0.04) {
          drawPrism(
            item.cx,
            item.cz,
            0,
            solvedH,
            0.34,
            w,
            h,
            "rgba(45, 226, 196, 0.92)",
            "rgba(15, 181, 160, 0.85)",
            "rgba(10, 143, 60, 0.85)"
          );
        }

        // Open top segment (Coral/Amber)
        const topPrism = drawPrism(
          item.cx,
          item.cz,
          solvedH,
          openH,
          0.34,
          w,
          h,
          item.area.open > 5 ? "rgba(255, 93, 93, 0.95)" : "rgba(255, 185, 56, 0.95)",
          "rgba(255, 130, 67, 0.86)",
          "rgba(91, 108, 240, 0.78)"
        );

        if (topPrism) {
          ctx.fillStyle = "rgba(233, 242, 239, 0.92)";
          ctx.font = "600 11px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.area.name, topPrism.centerTop.sx, topPrism.centerTop.sy - 10);

          projectedList.push({
            idx: item.idx,
            area: item.area,
            cx: topPrism.centerBot.sx,
            cy: topPrism.centerBot.sy,
            topY: topPrism.centerTop.sy,
            depth: item.depth,
            radius: 26,
          });
        }
      }

      towersRef.current = projectedList;
      raf = requestAnimationFrame(render);
    }

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [nodes]);

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;
      rotRef.current.yaw += dx * 0.008;
      rotRef.current.pitch = Math.max(0.2, Math.min(1.25, rotRef.current.pitch + dy * 0.006));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const hit = towersRef.current.find(
      (t) => Math.abs(px - t.cx) < t.radius && py >= t.topY - 14 && py <= t.cy + 14
    );
    if (hit) setSelected(hit.area);
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }

  return (
    <div className="cp-3d-shell">
      <div className="cp-3d-bar">
        <div className="cp-row" style={{ gap: 8 }}>
          <button
            type="button"
            className={`cp-btn-sm ${autoRotate ? "active" : ""}`}
            onClick={() => setAutoRotate((v) => !v)}
          >
            {autoRotate ? "Auto-Orbit: ON" : "Auto-Orbit: OFF"}
          </button>
          <button
            type="button"
            className="cp-btn-sm"
            onClick={() => {
              rotRef.current.zoom = Math.min(1.6, rotRef.current.zoom + 0.15);
            }}
          >
            + Zoom
          </button>
          <button
            type="button"
            className="cp-btn-sm"
            onClick={() => {
              rotRef.current.zoom = Math.max(0.7, rotRef.current.zoom - 0.15);
            }}
          >
            − Zoom
          </button>
          <button
            type="button"
            className="cp-btn-sm"
            onClick={() => {
              rotRef.current = { yaw: 0.65, pitch: 0.56, zoom: 1, auto: autoRotate };
            }}
          >
            Reset 3D
          </button>
        </div>
        <div className="cp-3d-legend">
          <span><i style={{ background: "#2de2c4" }} /> {lang === "bn" ? "সমাধান" : "Solved"}</span>
          <span><i style={{ background: "#ffb938" }} /> {lang === "bn" ? "চলমান" : "Open"}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="cp-3d-canvas"
        style={{ height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      <div className="cp-3d-hud">
        {selected ? (
          <div className="cp-row" style={{ justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <b>{selected.name}</b> — {selected.total.toLocaleString(loc)} {lang === "bn" ? "রিপোর্ট" : "reports"} ·{" "}
              <span style={{ color: "var(--g2)" }}>{selected.rate}% {lang === "bn" ? "সমাধান" : "solved"}</span> ·{" "}
              <span style={{ color: "var(--cp-amb)" }}>{selected.open.toLocaleString(loc)} {lang === "bn" ? "বাকি" : "open"}</span>
            </div>
            <Link href="/areas" className="cp-btn-sm active">
              {advT(lang, "hm_open_areas")} →
            </Link>
          </div>
        ) : (
          <span className="cp-mute">
            {lang === "bn"
              ? "মাউস দিয়ে টেনে 3D শহর ঘোরান বা যেকোনো এলাকার টাওয়ারে হোভার/ক্লিক করুন।"
              : "Drag to orbit the 3D city grid or hover/tap any Dhaka area tower."}
          </span>
        )}
      </div>
    </div>
  );
}
