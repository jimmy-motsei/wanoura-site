"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar(){
  const [open, setOpen] = useState(false);
  return (
    <nav className="w-full sticky top-0 z-50 bg-midnight/80 backdrop-blur border-b border-charcoal">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="font-bold tracking-wide text-xl">Warouna</Link>
        <button className="md:hidden" onClick={()=>setOpen(!open)} aria-label="Menu">☰</button>
        <ul className={`md:flex gap-8 ${open ? "block mt-4" : "hidden md:flex"}`}>
          <li><Link href="/#services">Services</Link></li>
          <li><Link href="/portfolio">Portfolio</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact" className="btn-secondary">Contact</Link></li>
        </ul>
      </div>
    </nav>
  );
}
