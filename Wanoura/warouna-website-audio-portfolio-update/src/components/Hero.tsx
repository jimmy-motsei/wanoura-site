import Link from "next/link";

export default function Hero(){
  return (
    <section className="min-h-[80vh] flex items-center">
      <div className="container">
        <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight">
          The Next Legend in Sound.
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-ivory/80 max-w-2xl">
          Crafted to move hearts. Built to last generations.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="#listen" className="btn-primary">Listen Now</Link>
          <Link href="/contact" className="btn-secondary">Contact Warouna</Link>
        </div>
      </div>
    </section>
  );
}
