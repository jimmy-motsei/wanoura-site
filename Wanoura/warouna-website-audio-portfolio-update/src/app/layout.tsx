import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Montserrat } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  title: "Warouna — The Next Legend in Sound",
  description: "Crafting bespoke soundscapes. Dreamed for you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${montserrat.variable} bg-midnight text-ivory`}>
        {children}
      </body>
    </html>
  );
}
