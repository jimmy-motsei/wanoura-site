export default function Services(){
  const items = [
    { title: "Scoring & Composition", desc: "Music with a heartbeat. Crafted to elevate stories into legends."},
    { title: "Sound Design & Audio Post", desc: "Worlds built in sound. Details that pull you in and never let go."},
    { title: "Branded Audio Experiences", desc: "Signatures in sound. Campaigns and identities that echo."},
  ];
  return (
    <section id="services" className="section">
      <div className="container">
        <h2 className="text-3xl md:text-5xl font-bold font-serif">What We Create</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {items.map((it)=> (
            <div key={it.title} className="rounded-2xl border border-charcoal p-6">
              <h3 className="text-xl font-semibold">{it.title}</h3>
              <p className="mt-3 text-ivory/80">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
