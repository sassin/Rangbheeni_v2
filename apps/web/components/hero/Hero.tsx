"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Lenis from "lenis";

/**
 * DenimTexture Component
 * Uses global CSS utilities and SVG filters defined in layout.tsx
 */
function DenimTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-brand-mesh" />
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ filter: "url(#denimWeave)" }}
      />
      <div className="absolute inset-0 opacity-[0.06] bg-denim-twill" />
      <div className="absolute inset-0 opacity-[0.04] bg-weave" />
    </div>
  );
}

function RangDivider() {
  return (
    <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--rang-primary)] via-[var(--rang-secondary)] to-[var(--rang-highlight)] opacity-90" />
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const textRotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const textRotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  const images = useMemo(
    () => [
      { src: "/images/hero/community.jpg", alt: "Community" },
      { src: "/images/hero/crafting.jpg", alt: "Crafting" },
      { src: "/images/hero/product.JPG", alt: "Product" },
    ],
    []
  );

  const letterVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.04,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1] as any,
      },
    }),
  };

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX / innerWidth - 0.5);
      mouseY.set(clientY / innerHeight - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    const t = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 6000);

    return () => {
      lenis.destroy();
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(t);
    };
  }, [images.length, mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#efeeea]"
    >
      <DenimTexture />

      <div className="relative z-10 mx-auto h-full w-full max-w-7xl px-8 md:px-12">
        <div className="flex h-full items-center pb-0 md:pb-12">
          <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left Side: Content */}
            <div className="order-2 lg:order-1 perspective-1000">
              <motion.div
                style={{ rotateX: textRotateX, rotateY: textRotateY }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="will-change-transform"
              >
                <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-6xl">
                  <span className="flex flex-wrap">
                    {"Weaving change".split("").map((char, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={letterVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </span>
                  <span className="block font-bold text-[var(--rang-primary)]">
                    from waste.
                  </span>
                </h1>

                <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-neutral-700">
                  A women-led grassroots initiative working at the intersection of textile waste, climate justice, and social equity.
                </p>
              </motion.div>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="origin-left"
                >
                    <RangDivider />
                </motion.div>
            </div>

            {/* Right Side: Tactile Image Slits */}
            <div className="order-1 relative flex h-[42vh] gap-2 sm:h-[46vh] lg:order-2 lg:h-[60vh]">
              {[...Array(5)].map((_, i) => {
                const factor = (i + 1) * 20;
                return (
                  <motion.div
                    key={i}
                    style={{
                      y: useTransform(springY, [-0.5, 0.5], [-factor, factor]),
                    }}
                    className="relative h-full flex-1 overflow-hidden rounded-full border border-black/10 shadow-2xl"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={images[index].src + i}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{
                          duration: 1.2,
                          delay: i * 0.1,
                          ease: [0.22, 1, 0.36, 1] as any,
                        }}
                        className="absolute inset-0 h-full"
                        style={{
                          width: "500%",
                          left: `-${i * 100}%`,
                        }}
                      >
                        <img
                          src={images[index].src}
                          alt={images[index].alt}
                          className="h-full w-full object-cover grayscale-[0.1]"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Footer - Desktop only, pinned inside hero */}
      {isDesktop && (
        <>
          <div className="pointer-events-none absolute inset-y-0 bottom-0 left-0 z-20 w-24 bg-gradient-to-r from-[#efeeea] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 bottom-0 right-0 z-20 w-24 bg-gradient-to-l from-[#efeeea] to-transparent" />

          <div className="absolute bottom-0 left-0 z-10 w-full overflow-hidden border-t border-black/5 bg-white/5 py-4">
            <motion.div
              animate={{ x: [0, -1500] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="flex gap-24 whitespace-nowrap font-body text-[9px] font-bold uppercase tracking-[0.8em] text-neutral-400"
            >
              {Array(4)
                .fill("Upcycled Heritage • Social Equity • Climate Justice • Women Led • ")
                .map((text, i) => (
                  <span key={i}>{text}</span>
                ))}
            </motion.div>
          </div>
        </>
      )}
    </section>
  );
}