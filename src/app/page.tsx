import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import { Ticker, How, Categories, LiveMap, BeforeAfter, Leaderboard, Faq } from "@/components/sections";
import { LiveStats, Features, ForDepts, Testimonials, SiteFooter } from "@/components/extra-sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <LiveStats />
        <How />
        <Features />
        <Categories />
        <LiveMap />
        <BeforeAfter />
        <ForDepts />
        <Leaderboard />
        <Testimonials />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}