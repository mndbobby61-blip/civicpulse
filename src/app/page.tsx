import SvgSprite from "@/components/svg-sprite";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <>
      <SvgSprite />
      <Navbar />
      <main>
        <Hero />
      </main>
    </>
  );
}