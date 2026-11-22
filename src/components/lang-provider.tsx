"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { dict, type Lang, type Key } from "@/lib/dict";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string };

const LangCtx = createContext<Ctx>({
  lang: "bn",
  setLang: () => {},
  t: (k) => dict.bn[k],
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("cp-lang");
    if (saved === "bn" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("cp-lang", l);
  }

  const t = (k: Key) => dict[lang][k];

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);