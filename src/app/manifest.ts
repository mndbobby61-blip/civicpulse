import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CivicPulse — Smart City Infrastructure Platform",
    short_name: "CivicPulse",
    description: "Report city infrastructure issues, track repairs in real time, and monitor department SLA transparency.",
    start_url: "/",
    display: "standalone",
    background_color: "#050a16",
    theme_color: "#0fb5a0",
    icons: [
      {
        src: "/globe.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
