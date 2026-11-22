import SvgSprite from "@/components/svg-sprite";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import {
  Ticker, Stats, How, Categories, LiveMap, BeforeAfter, Leaderboard, Faq, Footer,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <SvgSprite />
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Stats />
        <How />
        <Categories />
        <LiveMap />
        <BeforeAfter />
        <Leaderboard />
        <Faq />
      </main>
      <Footer />
    </>
  );
}