  import Link from "next/link";
  import Navbar from "@/src/components/Navbar";
  import Footer from "@/src/components/Footer";
  import AudioPlayer from "@/src/components/AudioPlayer";

  // Simple in-file mock data. Replace with real data or CMS later.
  const PROJECTS = [
    {
      slug: "golden-horizon",
      title: "Golden Horizon",
      summary: "A cinematic score blending orchestral warmth with modern texture.",
      audio: "/audio/golden-horizon.mp3",
      body: `
Inspired by the glow of dawn — strings, brass, and subtle analog synths weaving a sense of ascent. 
Built for a brand film that needed both intimacy and scale.`
    },
    {
      slug: "urban-pulse",
      title: "Urban Pulse",
      summary: "Percussive, layered, and alive — a sonic identity for a modern lifestyle brand.",
      audio: "/audio/urban-pulse.mp3",
      body: `
Polyrhythms and vocal chops meet deep bass to form a signature brand cadence.
Minimal yet memorable.`
    }
  ] as const;

  function getProject(slug: string){
    return PROJECTS.find(p => p.slug === slug);
  }

  export default function PortfolioDetail({ params }: { params: { slug: string }}){
    const project = getProject(params.slug);
    if(!project){
      return (
        <>
          <Navbar />
          <main className="section">
            <div className="container">
              <h1 className="text-4xl md:text-6xl font-serif font-bold">Project not found</h1>
              <p className="mt-4 text-ivory/80">Return to the <Link href="/portfolio" className="underline">portfolio</Link>.</p>
            </div>
          </main>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Navbar />
        <main className="section">
          <div className="container max-w-3xl">
            <Link href="/portfolio" className="text-ivory/70 underline">← Back to Portfolio</Link>
            <h1 className="mt-6 text-4xl md:text-6xl font-serif font-bold">{project.title}</h1>
            <p className="mt-4 text-ivory/80">{project.summary}</p>

            <div className="mt-8">
              {/* Use a real file path under public/audio in your project */}
              <AudioPlayer src={project.audio} title={project.title} subtitle="Preview" />
            </div>

            <article className="prose prose-invert mt-8">
              <p>{project.body}</p>
            </article>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  export async function generateStaticParams(){
    return [{ slug: "golden-horizon" }, { slug: "urban-pulse" }];
  }
