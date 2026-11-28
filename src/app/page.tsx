import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import { HomeNoticeBanner, HomeAdvancedSection } from "@/components/home-live-addons";
import { Ticker, How, Categories, LiveMap, BeforeAfter, Leaderboard, Faq } from "@/components/sections";
import {
  LiveStats, Features, ForDepts, Testimonials, SiteFooter,
  Compare, Track, Areas, SlaPromise, Security, Roadmap,
} from "@/components/extra-sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <HomeNoticeBanner />
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
        <HomeAdvancedSection />
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