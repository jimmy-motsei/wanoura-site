import Navbar from "@/src/components/Navbar";
import Hero from "@/src/components/Hero";
import Services from "@/src/components/Services";
import PortfolioPreview from "@/src/components/PortfolioPreview";
import CTA from "@/src/components/CTA";
import Footer from "@/src/components/Footer";

export default function Page(){
  return (
    <>
      <Navbar />
      <Hero />
      <main>
        <section className="section">
          <div className="container">
            <h2 className="text-3xl md:text-5xl font-bold font-serif">The Essence</h2>
            <p className="mt-4 text-ivory/80 max-w-2xl">
              Warouna is a visionary sound architect blending soul, innovation, and storytelling into music that moves the world.
              This is more than audio. It is legacy in motion.
            </p>
          </div>
        </section>
        <Services />
        <PortfolioPreview />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
