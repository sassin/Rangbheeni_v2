"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";

const services = [
  {
    id: "gifting",
    title: "Sustainable gifting",
    desc: "Handcrafted upcycled products suitable for corporate gifting and event moments.",
    impact: "10,000 litre water saved / kg",
    tag: "Circular",
    bg: "bg-[rgba(132,188,65,0.08)]" // Primary Green Tint
  },
  {
    id: "csr",
    title: "CSR programs",
    desc: "Collaborate on women’s livelihoods, circularity, and community education support.",
    impact: "100% Socially Traceable",
    tag: "Empower",
    bg: "bg-[rgba(0,123,196,0.05)]" // Accent Blue Tint
  },
  {
    id: "workshops",
    title: "Workshops & events",
    desc: "Sustainability and DIY upcycling workshops for institutions and corporates.",
    impact: "Zero-Waste Learning",
    tag: "Educate",
    bg: "bg-[rgba(82,45,34,0.04)]" // Brown/Earth Tint
  }
];

function RangDivider() {
  return (
    <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)]" />
  );
}

// Animation variants for the tag
const tagVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
    rotate: -10,
    scale: 0.9,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 3,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      delay: 0.35,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const, 
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    rotate: 0,
    filter: "blur(2px)",
    transition: {
      duration: 0.3,
    },
  },
};

export default function CorporateCollab() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Header - Matches other pages */}
        <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-5xl tracking-tight">
          Corporate <span className="text-[var(--color-primary)]">Collaborations</span>
        </h2>
        <p className="mt-2 font-body text-neutral-700 max-w-2xl">
          We partner with organizations for climate-conscious gifting, CSR engagement, and sustainability workshops.
        </p>
        <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="origin-left"
                  >
                     <RangDivider />
          </motion.div>

        {/* The Smooth Unfolding Rows */}
        <div className="mt-12 flex flex-col border-t border-neutral-100">
          {services.map((s) => (
            <div
              key={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative border-b border-neutral-100 group"
            >
              {/* Trigger Row */}
              <div className="flex items-center justify-between py-4 px-4 cursor-pointer transition-all">
                <h3 className={`font-heading text-lg font-bold transition-all duration-700 ${hovered === s.id ? 'text-[var(--color-brown)] translate-x-2' : 'text-neutral-400'}`}>
                  {s.title}
                </h3>
                
                {/* HEAVY STITCH ELEMENT */}
                <div className="relative flex items-center justify-end w-24 h-10 overflow-hidden">
                  {/* The Sewing Path (The "Thread") */}
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: hovered === s.id ? 1 : 0,
                      opacity: hovered === s.id ? 1 : 0 
                    }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="absolute right-6 h-[2px] w-full origin-right border-t-2 border-dashed border-[var(--color-primary)]"
                  />
                  
                  {/* The "Needle/Anchor" (A Bold, Rounded Pillar) */}
                  <motion.div
                    animate={{ 
                      x: hovered === s.id ? -15 : 0,
                      height: hovered === s.id ? "12px" : "24px",
                      backgroundColor: hovered === s.id ? 'var(--color-primary)' : '#737373' // neutral-500
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-[4px] rounded-full relative z-10"
                  >
                    {/* Visual weight: A small shadow to make the "needle" pop */}
                    {hovered === s.id && (
                      <motion.div 
                        layoutId="glow"
                        className="absolute inset-0 bg-[var(--color-primary)] blur-sm opacity-50" 
                      />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Smooth Full-Card Reveal */}
              <AnimatePresence>
                {hovered === s.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className={`relative mb-8 rounded-2xl ${s.bg} transition-colors duration-1000 overflow-hidden`}>
                      
                      {/* Kinetic RangDivider Line */}
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)] origin-left"
                      />
                      
                      <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="max-w-md">
                          <p className="font-body text-sm leading-relaxed text-neutral-700">
                            {s.desc}
                          </p>
                        </div>

                        {/* ANIMATED Garment Tag */}
                        <motion.div 
                          variants={tagVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="shrink-0 flex items-center bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm relative overflow-hidden group-hover:shadow-lg transition-shadow duration-500"
                        >
                          {/* The "Thread" Hole Punch */}
                          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-neutral-100 shadow-inner" />
                          
                          <div className="flex flex-col border-l-2 border-dashed border-neutral-300 pl-4 mt-1">
                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                              {s.tag}
                            </span>
                            <span className="text-xs font-bold text-[var(--color-brown)] whitespace-nowrap">
                              {s.impact}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-3">
          <a
            href="mailto:enquiries.rangbheeni@gmail.com?subject=Rangbheeni Collaboration Inquiry&body=Hi Rangbheeni team,%0D%0A%0D%0AI would like to explore a collaboration.%0D%0A%0D%0AOrganization:%0D%0AType of collaboration:%0D%0A%0D%0AThanks,"
            className="rounded-xl bg-neutral-50 px-5 py-3 font-body text-sm font-semibold text-neutral-800 shadow-sm hover:bg-[var(--color-lightgreen)] transition-all"
          >
            Start a conversation
          </a>
        </div>
      </div>
    </section>
  );
}