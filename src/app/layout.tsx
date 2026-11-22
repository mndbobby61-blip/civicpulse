import type { Metadata } from "next";
import { Bricolage_Grotesque, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import "./civicpulse.css";
import { LangProvider } from "@/components/lang-provider";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "800"],
  variable: "--font-display",
});
const body = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CivicPulse",
  description: "শহরের সমস্যা জানান, সমাধান ট্র্যাক করুন",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${display.variable} ${body.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}