import Link from "next/link";

export default function CTA(){
  return (
    <section className="section">
      <div className="container text-center">
        <h3 className="text-3xl md:text-4xl font-serif font-bold">The Invitation</h3>
        <p className="mt-4 text-ivory/80 max-w-2xl mx-auto">
          The world doesn’t need another playlist. It needs another story. Warouna is ready to create yours.
        </p>
        <div className="mt-8">
          <Link href="/contact" className="btn-primary">Step Into the Dream</Link>
        </div>
      </div>
    </section>
  );
}
