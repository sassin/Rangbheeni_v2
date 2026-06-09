"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import DenimTexture from "@/components/shared/DenimTexture";
import RangDivider from "@/components/shared/RangDivider";
import PageBackground from "@/components/layout/PageBackground";
import ImpactSnapshot from "@/components/home/ImpactSnapshot";



function ArtisanCard({ artisan, index }: { artisan: any; index: number }) {
  const rotations = [-2.5, 1.8, -1.2, 2.2, -1.6, 1.1];
  const rotate = rotations[index % rotations.length];
  return (
    <motion.div initial={{ opacity: 0, y: 18, rotate: rotate + 2 }} whileInView={{ opacity: 1, y: 0, rotate }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: index * 0.05 }} className="group relative">
      <div className="relative rounded-[1.6rem] border border-black/8 bg-white/70 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <div className="absolute left-1/2 top-2 z-30 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--rang-primary)]/70 shadow-sm" />
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.2rem] bg-neutral-200">
          <motion.img src={artisan.photo} alt={artisan.name} className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, #000 3px)", backgroundSize: "4px 4px" }} />
          <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-[var(--rang-accent)]/82 via-[var(--rang-accent)]/12 to-transparent p-4 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
            <div className="translate-y-3 space-y-2 transition-transform duration-500 group-hover:translate-y-0">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--rang-secondary)]">{artisan.location}</span>
              <div className="h-px w-10 border-t border-dashed border-white/40" />
              <p className="line-clamp-4 font-body text-[11px] italic leading-relaxed text-white opacity-0 transition-opacity delay-75 group-hover:opacity-100">â€œ{artisan.quote}â€</p>
            </div>
          </div>
        </div>
        <div className="px-2 pb-2 pt-3">
          <h3 className="font-heading text-sm font-bold leading-tight text-[var(--rang-accent)] transition-colors duration-300 group-hover:text-[var(--rang-primary)] md:text-base">{artisan.name}</h3>
          <div className="mt-1 h-[2px] w-6 bg-[var(--rang-secondary)] transition-all duration-500 group-hover:w-full" />
        </div>
      </div>
    </motion.div>
  );
}

export default function JourneyPageClient({ content, impact }: { content: any; impact: any }) {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [showCard, setShowCard] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.05) {
        setActiveMilestone(null);
        setShowCard(false);
        return;
      }
      const index = Math.min(Math.floor(latest * content.timeline.items.length), content.timeline.items.length - 1);
      setActiveMilestone(index);
      setShowCard(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowCard(false), 3000);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scrollYProgress]);

  const wavyPath = "M 10 0 Q 30 150 10 300 Q -10 450 10 600 Q 30 750 10 900";

  return (
    <PageBackground variant="paper">
      <main ref={containerRef} className="relative bg-[#efeeea] text-[var(--rang-accent)] selection:bg-[var(--rang-primary)] selection:text-white">
        <DenimTexture />
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-black/5 py-24 md:w-24">
          <svg width="40" height="100%" viewBox="0 0 20 900" preserveAspectRatio="none" className="mt-10 h-[70vh] opacity-20">
            <path d={wavyPath} fill="none" stroke="black" strokeWidth="0.5" strokeDasharray="4 4" />
            <motion.path d={wavyPath} fill="none" stroke="var(--rang-primary)" strokeWidth="2" style={{ pathLength }} className="drop-shadow-[0_0_8px_var(--rang-primary)]" />
          </svg>
          <div className="absolute left-full ml-2 w-[9.5rem] md:w-[10.5rem]" style={{ top: activeMilestone !== null ? `${25 + activeMilestone * 5}vh` : "20vh" }}>
            <AnimatePresence>
              {showCard && activeMilestone !== null ? (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.2 }} className="group rounded-[0.8rem] border border-black/5 bg-white/20 px-2.5 py-2 shadow-[0_6px_18px_rgba(0,0,0,0.05)] backdrop-blur-sm">
                  <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-[var(--rang-primary)]/80">{content.timeline.items[activeMilestone].year}</span>
                  <h4 className="mt-[2px] text-[10px] font-medium uppercase leading-tight text-[var(--rang-accent)]/85">{content.timeline.items[activeMilestone].title}</h4>
                  <div className="mt-1.5 h-px w-6 bg-[var(--rang-primary)]/15 transition-all duration-300 group-hover:w-10" />
                  <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-32 group-hover:opacity-100">
                    <p className="mt-1.5 text-[9px] leading-[1.5] text-neutral-600/85">{content.timeline.items[activeMilestone].text}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </aside>

        <div className="relative z-10 pl-24 pr-8 md:pl-52 md:pr-20 lg:pl-72">
          <section className="flex min-h-[90vh] max-w-5xl flex-col justify-center py-32">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">{content.origin.title}</h1>
              <RangDivider />
              <div className="mt-16 grid gap-16 text-justify md:grid-cols-2">
                <div className="space-y-8 text-base font-medium leading-relaxed text-neutral-800 md:text-lg">
                  <p>{content.origin.paragraphs[0]}</p>
                  <p className="border-l-2 border-[var(--rang-secondary)] pl-6 text-sm italic leading-relaxed text-neutral-500 md:text-base">{content.origin.paragraphs[1]}</p>
                </div>
                <div className="space-y-8 text-sm leading-relaxed text-neutral-500">
                  <p>{content.origin.paragraphs[2]}</p>
                  <p className="text-lg font-bold leading-tight text-[var(--rang-primary)]">{content.origin.paragraphs[3]}</p>
                </div>
              </div>
            </motion.div>
          </section>

          <section className="flex max-w-5xl flex-col border-t border-black/10 justify-center py-16">
            <ImpactSnapshot impact={impact} enableGlobalDetailsModal />
          </section>

          <section className="relative border-t border-black/10 max-w-5xl py-16">
            <div className="mb-20 ">
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">{content.artisans.title}</h1>
              <p className="mt-2 font-body text-[var(--rang-primary)]">{content.artisans.subtitle}</p>
              <RangDivider />
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {content.artisans.items.map((artisan: any, index: number) => <ArtisanCard key={`${artisan.name}-${index}`} artisan={artisan} index={index} />)}
            </div>
          </section>

          <section className="relative border-t border-black/10 max-w-5xl py-16">
            <div className="max-w-3xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-brown)] md:text-5xl">{content.next.title}</h2>
              <RangDivider />
              <p className="mt-8 max-w-5xl font-body text-base leading-relaxed text-justify text-neutral-700 md:text-lg">{content.next.text}</p>
            </div>
          </section>
          <div className="h-[20vh]" />
        </div>
      </main>
    </PageBackground>
  );
}


