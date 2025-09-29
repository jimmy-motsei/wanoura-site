import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export default function Contact(){
  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold">Step Into the Future of Sound</h1>
          <p className="mt-6 text-ivory/80">
            The invitation is open. Let’s create something unforgettable together.
          </p>
          <form className="mt-10 grid gap-4">
            <input className="bg-transparent border border-charcoal rounded-xl px-4 py-3" placeholder="Name" />
            <input className="bg-transparent border border-charcoal rounded-xl px-4 py-3" placeholder="Email" />
            <input className="bg-transparent border border-charcoal rounded-xl px-4 py-3" placeholder="Project Type" />
            <textarea className="bg-transparent border border-charcoal rounded-xl px-4 py-3 min-h-[160px]" placeholder="Message" />
            <button className="btn-primary w-full">Send Message</button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
