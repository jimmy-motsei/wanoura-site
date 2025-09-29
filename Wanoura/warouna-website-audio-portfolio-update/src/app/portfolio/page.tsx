import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

const PROJECTS = [
  { slug: "golden-horizon", title: "Golden Horizon" },
  { slug: "urban-pulse", title: "Urban Pulse" },
  { slug: "nocturne-echoes", title: "Nocturne Echoes" },
  { slug: "desert-sunrise", title: "Desert Sunrise" },
  { slug: "electric-serenade", title: "Electric Serenade" },
  { slug: "midnight-portrait", title: "Midnight Portrait" },
];

export default function Portfolio(){
  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-serif font-bold">Dreams Brought to Life</h1>
          <p className="mt-6 text-ivory/80 max-w-3xl">
            Every project is a world. Each sound a story. Explore a selection of works crafted with depth, precision, and soul.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {PROJECTS.map((p)=>(
              <Link key={p.slug} href={`/portfolio/${p.slug}`} className="aspect-video rounded-2xl bg-charcoal/50 border border-charcoal flex items-center justify-center hover:border-gold">
                <span className="text-ivory/80">{p.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
