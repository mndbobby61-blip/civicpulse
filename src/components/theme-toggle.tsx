"use client";
import { useEffect, useState } from "react";
import { useLang } from "./lang-provider";

export default function ThemeToggle() {
  const { t } = useLang();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const a = document.documentElement.dataset.theme;
    setDark(a ? a === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  function flip() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("cp-theme", next ? "dark" : "light");
    } catch {}
  }

  const label = dark ? t("th_light") : t("th_dark");
  return (
    <button className="cp-themebtn" onClick={flip} aria-label={label} title={label}>
      <svg aria-hidden="true"><use href={dark ? "#i-sun" : "#i-moon"} /></svg>
    </button>
  );
}