import Link from "next/link";

export default function PortfolioPreview(){
  const thumbs = [1,2,3];
  return (
    <section className="section">
      <div className="container">
        <h2 className="text-3xl md:text-5xl font-bold font-serif">Dreams Brought to Life</h2>
        <p className="mt-3 text-ivory/80 max-w-2xl">A glimpse of the worlds Warouna has shaped.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {thumbs.map((n)=> (
            <div key={n} className="aspect-video rounded-2xl bg-charcoal/50 border border-charcoal flex items-center justify-center">Thumbnail {n}</div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/portfolio" className="btn-secondary">View Full Portfolio</Link>
        </div>
      </div>
    </section>
  );
}
