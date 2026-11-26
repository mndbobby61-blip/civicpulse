import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import { Ticker, How, Categories, LiveMap, BeforeAfter, Leaderboard, Faq } from "@/components/sections";
import {
  LiveStats, Features, ForDepts, Testimonials, SiteFooter,
  Compare, Track, Areas, SlaPromise, Security, Roadmap,
} from "@/components/extra-sections";

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
        <Compare />
        <Categories />
        <LiveMap />
        <Track />
        <BeforeAfter />
        <Areas />
        <SlaPromise />
        <ForDepts />
        <Security />
        <Leaderboard />
        <Testimonials />
        <Roadmap />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}