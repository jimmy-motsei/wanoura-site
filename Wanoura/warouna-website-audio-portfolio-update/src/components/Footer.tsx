export default function Footer(){
  return (
    <footer className="border-t border-charcoal">
      <div className="container py-10 text-sm text-ivory/70">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Warouna. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="YouTube">YouTube</a>
            <a href="#" aria-label="Spotify">Spotify</a>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
