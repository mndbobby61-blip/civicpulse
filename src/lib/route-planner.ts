export type RouteStop = {
  id: string;
  seq: number;
  title: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  priority: string;
  slaDueAt: string | null;
  cat: string;
  catBn: string | null;
};

export type OrderedStop = RouteStop & {
  step: number;
  distanceKm: number;
  cumulativeKm: number;
};

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-circle distance in kilometers between two coordinates.
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Orders field stops using a nearest-neighbor heuristic weighted slightly by CRITICAL/overdue urgency.
 */
export function optimizeFieldRoute(
  stops: RouteStop[],
  startLat: number,
  startLng: number
): { ordered: OrderedStop[]; totalKm: number } {
  const remaining = [...stops];
  const ordered: OrderedStop[] = [];
  let curLat = startLat;
  let curLng = startLng;
  let cumulativeKm = 0;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestCost = Number.POSITIVE_INFINITY;
    let bestDist = 0;

    for (let i = 0; i < remaining.length; i += 1) {
      const s = remaining[i];
      const dist = haversineKm(curLat, curLng, s.lat, s.lng);
      const urgencyBonus = s.priority === "CRITICAL" ? 0.65 : s.priority === "HIGH" ? 0.85 : 1;
      const cost = dist * urgencyBonus;
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = i;
        bestDist = dist;
      }
    }

    const [chosen] = remaining.splice(bestIdx, 1);
    cumulativeKm += bestDist;
    ordered.push({
      ...chosen,
      step: ordered.length + 1,
      distanceKm: Number(bestDist.toFixed(2)),
      cumulativeKm: Number(cumulativeKm.toFixed(2)),
    });
    curLat = chosen.lat;
    curLng = chosen.lng;
  }

  return { ordered, totalKm: Number(cumulativeKm.toFixed(2)) };
}
