export default function SvgSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="city" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <rect width="1000" height="600" style={{ fill: "var(--land)" }} />
          <g style={{ fill: "var(--park)" }}>
            <path d="M640 60l140-20 60 70-40 80-150 10z" />
            <path d="M140 120l90-25 50 40-20 70-110 10z" />
            <path d="M330 400l120-15 40 60-70 50-100-20z" />
          </g>
          <path d="M-20 540C160 480 300 570 480 520S800 440 1020 500" style={{ fill: "none", stroke: "var(--water)", strokeWidth: 38, strokeLinecap: "round" }} />
          <path id="m1" fill="none" strokeLinecap="round" strokeWidth="7" style={{ stroke: "var(--roadc)" }} d="M-20 90H1020M-20 190H1020M-20 410H1020M120-20V620M260-20V620M400-20V620M740-20V620M880-20V620M-20 140L300-20M300 620L620 380M700 620L1020 300M520 90V300M820 190V400M60 190V420" />
          <use href="#m1" strokeWidth="4.5" style={{ stroke: "var(--road)", fill: "none" }} />
          <path id="m2" fill="none" strokeLinecap="round" strokeWidth="15" style={{ stroke: "var(--roadc)" }} d="M-20 310C200 280 400 340 600 295S900 270 1020 305M70 620C240 420 330 200 480-20M1020-10C860 120 760 220 600 295C520 335 470 420 440 620" />
          <use href="#m2" strokeWidth="11" style={{ stroke: "var(--road)", fill: "none" }} />
        </symbol>
        <symbol id="i-cam" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" /><circle cx="12" cy="13" r="3" /></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></symbol>
        <symbol id="i-wrench" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" /></symbol>
        <symbol id="i-road" viewBox="0 0 24 24"><path d="M4 21 8 3M20 21 16 3M12 4v3M12 10.5v3M12 17v3" /></symbol>
        <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6M10 22h4" /></symbol>
        <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></symbol>
        <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></symbol>
        <symbol id="i-build" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></symbol>
        <symbol id="i-walk" viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="2" /><path d="m9 22 2-7-3-3 2-5 4 2 3 3M11 15l3 2 1 5" /></symbol>
        <symbol id="i-file" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></symbol>
        <symbol id="i-smile" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></symbol>
                <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></symbol>
        <symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 3v18h18" /><path d="M7 14l4-4 4 3 5-6" /></symbol>
        <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></symbol>
        <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></symbol>
        <symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></symbol>
        <symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></symbol>
                <symbol id="i-mic" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></symbol>
                        <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></symbol>
        <symbol id="i-moon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></symbol>
        <symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></symbol>
      </defs>
    </svg>
  );
}