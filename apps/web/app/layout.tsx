import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { Announcement } from "@/components/Announcement";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Rangbheeni | Sustainable Textile NGO",
  description: "Repurposing pre-loved textiles to empower marginalized women in India.",
  icons: {
    icon: [
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon.ico" },
  ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#efeeea] font-sans text-neutral-900 antialiased overflow-x-hidden">
        <svg className="pointer-events-none absolute h-0 w-0 opacity-0" aria-hidden="true">
          <defs>
            <filter id="denimWeave">
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="4" stitchTiles="stitch" />
              <feDiffuseLighting lightingColor="#ffffff" surfaceScale="2">
                <feDistantLight azimuth="45" elevation="35" />
              </feDiffuseLighting>
            </filter>
            <filter id="linenWeave">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
              <feDiffuseLighting lightingColor="#ffffff" surfaceScale="1.2">
                <feDistantLight azimuth="45" elevation="50" />
              </feDiffuseLighting>
            </filter>
          </defs>
        </svg>

        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-blue-600 via-transparent to-indigo-900" />
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{ filter: "url(#denimWeave)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <SmoothScroll>
          <div className="relative z-10">
            <Navbar />
            {children}
            <Footer />
            <Announcement />
            <ChatWidget />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}

