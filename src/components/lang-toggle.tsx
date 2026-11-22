"use client";
import { useLang } from "./lang-provider";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="cp-lang" role="group" aria-label="Language">
      <button className={lang === "bn" ? "on" : ""} onClick={() => setLang("bn")}>বাংলা</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}