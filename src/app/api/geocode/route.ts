import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

const HEADERS = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return Response.json({ error: "Unauthorized" }, { status: 401, headers: HEADERS });

  const rl = checkRateLimit(`geocode:${s.uid}`, 20, 60_000);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429, headers: HEADERS });

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 20 || lat > 27 || lng < 87 || lng > 93) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400, headers: HEADERS });
  }

  try {
    const nom = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
      {
        headers: { "User-Agent": "CivicPulse/1.0 (civic-infrastructure-platform)" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!nom.ok) {
      return Response.json(
        { address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, areaName: null },
        { headers: HEADERS }
      );
    }
    const data = (await nom.json()) as {
      display_name?: string;
      address?: {
        suburb?: string;
        neighbourhood?: string;
        road?: string;
        city_district?: string;
        city?: string;
        town?: string;
      };
    };
    const addr = data.address;
    const areaName =
      addr?.suburb ?? addr?.neighbourhood ?? addr?.city_district ?? addr?.town ?? addr?.city ?? null;
    const shortParts = [addr?.road, areaName, addr?.city].filter(Boolean);
    const formatted = shortParts.length > 0 ? shortParts.join(", ") : data.display_name ?? "";

    return Response.json(
      {
        address: formatted.slice(0, 190),
        areaName: areaName ? areaName.slice(0, 80) : null,
      },
      { headers: HEADERS }
    );
  } catch {
    return Response.json(
      { address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, areaName: null },
      { headers: HEADERS }
    );
  }
}
