import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export default function About(){
  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-serif font-bold">The Legacy of Sound</h1>
          <p className="mt-6 text-ivory/80 max-w-3xl">
            Music is more than notes and rhythms. It’s spirit, memory, and the bridge between generations.
            Warouna embodies this truth. Every project is crafted to stir emotion; every design is built to shape worlds;
            every score becomes part of a lasting story. This is not imitation. This is creation.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
