import type { Metadata } from "next";
import { Bricolage_Grotesque, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import "./civicpulse.css";
import "./civicpulse-advanced.css";
import { LangProvider } from "@/components/lang-provider";
import { MeProvider } from "@/components/me-provider";
import SvgSprite from "@/components/svg-sprite";
import PwaRegister from "@/components/pwa-register";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "800"], variable: "--font-display" });
const body = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "600"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "CivicPulse",
  description: "শহরের সমস্যা জানান, সমাধান ট্র্যাক করুন",
};

const THEME = `try{var t=localStorage.getItem('cp-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body>
        <SvgSprite />
        <PwaRegister />
        <LangProvider>
          <MeProvider>{children}</MeProvider>
        </LangProvider>
      </body>
    </html>
  );
}