"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef } from "react";

export default function FinalCTA() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Magnetic Logo Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const logoMoveX = useSpring(useTransform(mouseX, [-500, 500], [-25, 25]), springConfig);
  const logoMoveY = useSpring(useTransform(mouseY, [-500, 500], [-25, 25]), springConfig);
  const emailHref =
  "mailto:enquiries.rangbheeni@gmail.com?subject=Rangbheeni%20Let%27s%20connect&body=Hi%20Rangbheeni%20team,%0D%0A%0D%0AI%20would%20like%20to%20explore%20a%20collaboration.%0D%0A%0D%0AOrganization:%0D%0AType%20of%20collaboration:%0D%0A%0D%0AThanks,";

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const socials = [
    { name: "LinkedIn", url: "https://linkedin.com/company/rangbheeni" },
    { name: "Instagram", url: "https://instagram.com/rangbheeni" },
    { name: "Facebook", url: "https://facebook.com/rangbheeni" },
    { name: "Email", url: emailHref }
  ];

  return (
    <section
      id="connect" 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative z-[1] bg-[var(--color-denim)] py-10 md:py-14 overflow-hidden border-t border-white/5 "
    >
      {/* VIBRANT MAGNETIC LOGO */}
      <motion.div 
        style={{ x: logoMoveX, y: logoMoveY }}
        className="absolute -right-8 -bottom-8 z-0 h-56 w-56 md:h-[400px] md:w-[400px] pointer-events-none opacity-60 flex items-center justify-center transition-opacity duration-500"
      >
        <img
          src="/images/rangbheeni.svg"
          alt="Rangbheeni"
          className="hidden h-full w-full object-contain select-none drop-shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-8 w-full">
        <div className="flex flex-col items-start">
          
          {/* Compact Headline */}
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-5xl tracking-tight"
            >
              Let’s build sustainable <br />
              <span className="text-[var(--color-primary)]">communities together.</span>
            </motion.h2>
            
            <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accentblue)]" />
          </div>
          
          {/* BRAND-COLORED SOCIAL LINKS */}
          <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
            {socials.map((social) => (
              <Link 
                key={social.name} 
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block py-1"
              >
                {/* Text: Base state is Brown, Hover is Green */}
                <span className="relative z-10 block text-[11px] font-black uppercase tracking-[0.4em] text-[var(--color-brown)] transition-all duration-300 group-hover:tracking-[0.55em] group-hover:text-[var(--color-primary)] group-hover:drop-shadow-[0_0_1px_var(--color-primary)]">
                  {social.name}
                </span>
                
                {/* The "Stitch" Line: Green Thread */}
                <div className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[var(--color-primary)] transition-all duration-500 ease-in-out group-hover:w-full">
                   {/* Dashed detail for textile feel */}
                   <div className="absolute inset-0 border-b border-dashed border-white/20" />
                </div>

                {/* Animated Green Dot (The Needle) */}
                <motion.div 
                   className="absolute -bottom-1 left-0 h-[4px] w-[4px] rounded-full bg-[var(--color-primary)] opacity-0 transition-all duration-500 group-hover:left-[100%] group-hover:opacity-100 shadow-[0_0_8px_var(--color-primary)]"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}