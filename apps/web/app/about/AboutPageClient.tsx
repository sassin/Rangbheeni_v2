"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import PageBackground from "@/components/layout/PageBackground";
import DenimTexture from "@/components/shared/DenimTexture";
import RangDivider from "@/components/shared/RangDivider";

const easeCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];

function SponsorsStrip({ items }: { items: { name: string; logo: string }[] }) {
  const looped = [...items, ...items, ...items];

  return (
    <div className="group relative mt-8 overflow-hidden py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#efeeea] via-[#efeeea]/95 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#efeeea] via-[#efeeea]/95 to-transparent" />

      <div className="sponsor-marquee-track flex w-max items-center gap-14 md:gap-16">
        {looped.map((item, index) => (
          <motion.div
            key={`${item.name}-${index}`}
            whileHover={{ y: -4, scale: 1.6 }}
            transition={{ duration: 0.4 }}
            className="flex min-w-[170px] items-center justify-center md:min-w-[220px]"
          >
            <Image
              src={item.logo}
              alt={`${item.name} logo`}
              width={320}
              height={220}
              className="h-14 w-auto object-contain opacity-90 transition duration-300 hover:opacity-100 md:h-14"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AdvisorsPortraitGrid({ items }: { items: any[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const active = useMemo(
    () => (activeIndex !== null && items[activeIndex] ? items[activeIndex] : null),
    [activeIndex, items],
  );

  const offsets = [
    "md:mt-0",
    "md:mt-6",
    "md:mt-2",
    "md:mt-8",
    "md:mt-1",
    "md:mt-7",
    "md:mt-3",
    "md:mt-5",
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start gap-x-5 gap-y-8 md:gap-x-8 md:gap-y-10">
        {items.map((person, index) => (
          <motion.button
            key={`${person.name}-${index}`}
            type="button"
            onClick={() => {
              if (!person.shortBio) return;
              setActiveIndex((prev) => (prev === index ? null : index));
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: index * 0.04 }}
            whileHover={{ y: -6 }}
            className={[
              "group relative w-[82px] text-left sm:w-[88px] md:w-[92px] lg:w-[98px]",
              offsets[index % offsets.length],
            ].join(" ")}
          >
            <div className="relative">
              <motion.div
                animate={{
                  y: activeIndex === index ? -4 : 0,
                  scale: activeIndex === index ? 1.04 : 1,
                }}
                transition={{ duration: 0.28, ease: easeCurve }}
                className="relative aspect-[3/4] overflow-hidden rounded-[0.9rem]"
              >
                <img
                  src={person.photo}
                  alt={person.name}
                  className={[
                    "h-full w-full object-cover transition-all duration-700",
                    activeIndex === index
                      ? "scale-[1.03] grayscale-0"
                      : "grayscale-[0.35] group-hover:scale-[1.05] group-hover:grayscale-0",
                  ].join(" ")}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(86,43,0,0.28),transparent_44%)]" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, #000 3px)",
                    backgroundSize: "4px 4px",
                  }}
                />
                <motion.div
                  animate={{
                    opacity: activeIndex === index ? 1 : 0,
                    scale: activeIndex === index ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.22 }}
                  className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[var(--rang-primary)] shadow-[0_0_10px_rgba(9,113,13,0.35)]"
                />
              </motion.div>

              <motion.div
                animate={{
                  width: activeIndex === index ? "100%" : "1.4rem",
                  opacity: activeIndex === index ? 1 : 0.8,
                }}
                transition={{ duration: 0.32, ease: easeCurve }}
                className="mt-2 h-[2px] rounded-full bg-[var(--rang-primary)]"
              />
            </div>

            <div className="mt-2">
              <motion.p
                animate={{
                  color: activeIndex === index ? "var(--rang-primary)" : "var(--rang-accent)",
                }}
                transition={{ duration: 0.25 }}
                className="line-clamp-2 font-heading text-[11px] font-bold leading-tight md:text-[12px]"
              >
                {person.name}
              </motion.p>
              <p
                className={[
                  "mt-1 line-clamp-2 font-body text-[10px] leading-[1.35] transition-colors duration-300",
                  activeIndex === index ? "text-[var(--rang-primary)]" : "text-neutral-500",
                ].join(" ")}
              >
                {person.role}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active?.shortBio ? (
          <motion.div
            key={active.name}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: easeCurve }}
            className="mt-4 max-w-5xl"
          >
            <div className="flex items-center gap-3">
              <span className="font-body text-[10px] uppercase tracking-[0.22em] text-[var(--rang-primary)]/70">
                Spotlight
              </span>
              <div className="h-px flex-1 border-t border-dashed border-[var(--rang-primary)]/45" />
            </div>

            <motion.h3
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: 0.28 }}
              className="mt-4 font-heading text-2xl font-bold leading-tight text-[var(--rang-accent)] md:text-3xl"
            >
              {active.name}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.28 }}
              className="font-body text-sm font-medium text-[var(--rang-primary)]"
            >
              {active.role}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.3 }}
              className="max-w-5xl font-body text-[15px] leading-7 text-neutral-700"
            >
              {active.cred}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.32 }}
              className="mt-1 max-w-5xl font-body text-[15px] leading-7 text-neutral-700"
            >
              {active.shortBio}
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function AboutPageClient({ content }: { content: any }) {
  const { whoWeAre: who, founder, advisors, partners } = content;

  return (
    <PageBackground variant="paper">
      <main className="relative min-h-screen overflow-x-hidden bg-[#efeeea] text-[var(--color-brown)]">
        <DenimTexture opacity="soft" />

        <div className="relative z-10 pb-16 pl-24 pr-8 md:pl-52 md:pr-20 lg:pl-72">
          <section className="flex min-h-[90vh] max-w-5xl flex-col justify-center py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">
                {who.title}
              </h1>

              <RangDivider />

              <div className="mt-16 grid gap-16 text-justify md:grid-cols-2">
                <div className="space-y-8 text-base font-medium leading-relaxed text-neutral-800 md:text-lg">
                  <p>{who.paragraphs[0]}</p>
                  <p className="border-l-2 border-[var(--rang-secondary)] pl-6 text-sm italic leading-relaxed text-neutral-500 md:text-base">
                    {who.paragraphs[1]}
                  </p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-neutral-500">
                  <p>{who.paragraphs[2]}</p>
                  <p className="text-lg font-bold leading-tight text-[var(--rang-primary)]">
                    {who.paragraphs[3]}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          <section className="max-w-5xl border-t border-black/10 py-16">
            <h1 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight text-[var(--rang-accent)] md:text-4xl lg:text-5xl">
              What guides us
            </h1>

            <RangDivider />

            <div className="mx-auto mt-8 max-w-5xl">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.4fr_1.1fr] lg:items-start">
                <div className="flex justify-center lg:justify-start">
                  <div className="relative w-full max-w-[340px]">
                    <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[var(--color-accentblue)]/10 blur-3xl" />
                    <div className="absolute -bottom-6 right-0 h-24 w-24 rounded-full bg-[var(--color-lightgreen)]/10 blur-3xl" />

                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="group relative overflow-hidden rounded-[2rem]"
                    >
                      <div className="relative aspect-[4/4.8] overflow-hidden rounded-[2rem]">
                        <Image
                          src={founder.photo}
                          alt={founder.name}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-[1.045]"
                          sizes="(max-width: 1024px) 80vw, 340px"
                          priority
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(86,43,0,0.22),transparent_46%),radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.24),transparent_22%)]" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                        <div className="inline-flex flex-col bg-white/58 px-4 py-3 backdrop-blur-md">
                          <div className="font-heading text-[1.05rem] font-bold text-[var(--color-brown)]">
                            {founder.name}
                          </div>
                          <div className="mt-1 font-body text-sm text-neutral-700">
                            {founder.title}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="grid grid-cols-1 gap-8 md:gap-10">
                    <motion.div whileHover="hover" initial="rest" animate="rest" className="relative cursor-default">
                      <p className="font-body text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]/80">
                        Mission
                      </p>
                      <motion.div
                        variants={{
                          rest: { width: 56, opacity: 0.8 },
                          hover: { width: 96, opacity: 1 },
                        }}
                        className="mt-3 h-[2px] rounded-full bg-[var(--color-primary)]"
                      />
                      <motion.p
                        variants={{ rest: { x: 0 }, hover: { x: 6 } }}
                        className="mt-4 font-body text-[15.5px] leading-7 text-justify text-[var(--color-brown)]"
                      >
                        {who.mission}
                      </motion.p>
                    </motion.div>

                    <motion.div whileHover="hover" initial="rest" animate="rest" className="relative cursor-default">
                      <p className="font-body text-[10px] uppercase tracking-[0.24em] text-[var(--color-accentblue)]/80">
                        Vision
                      </p>
                      <motion.div
                        variants={{
                          rest: { width: 56, opacity: 0.8 },
                          hover: { width: 96, opacity: 1 },
                        }}
                        className="mt-3 h-[2px] rounded-full bg-[var(--color-accentblue)]"
                      />
                      <motion.p
                        variants={{ rest: { x: 0 }, hover: { x: 6 } }}
                        className="mt-4 font-body text-[15.5px] leading-7 text-justify text-[var(--color-brown)]"
                      >
                        {who.vision}
                      </motion.p>
                    </motion.div>
                  </div>
                </div>
              </div>

              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="mt-12">
                <div className="mx-auto max-w-5xl">
                  <p className="font-body text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                    Founder note
                  </p>
                  <div className="mt-3 h-[2px] w-16 rounded-full bg-gradient-to-r from-[var(--color-lightgreen)] via-[var(--color-accentblue)] to-[var(--color-lightgreen)]" />

                  <div className="mt-5 space-y-4">
                    {founder.paragraphs.slice(0, 2).map((paragraph: string, index: number) => (
                      <motion.p
                        key={index}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.18 }}
                        className="font-body text-[15px] leading-7 text-justify text-neutral-800"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>

                  {founder.quote ? (
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.22 }}
                      className="mt-6 border-l-2 border-[var(--color-primary)]/30 pl-4"
                    >
                      <p className="font-quote text-[15px] leading-7 text-[var(--color-brown)]">
                        “{founder.quote}”
                      </p>
                      <p className="mt-1 font-body text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                        — {founder.name}
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              </motion.div>
            </div>
          </section>

          <section className="mt-16 max-w-5xl border-t border-black/10 py-16 md:mt-18">
            <div className="mb-16 max-w-5xl">
              <h1 className="mt-4 font-heading text-3xl font-bold leading-[1.05] tracking-tight text-[var(--rang-accent)] md:text-4xl lg:text-5xl">
                {advisors.title}
              </h1>
              <p className="mt-2 max-w-3xl font-body text-[var(--rang-primary)]">
                {advisors.subtitle}
              </p>
              <RangDivider />
            </div>

            <AdvisorsPortraitGrid items={advisors.items} />
          </section>

          <section className="mt-16 max-w-5xl border-t border-black/10 py-16 md:mt-18">
            <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">
              {partners.title}
            </h1>
            <p className="max-w-3xl font-body text-neutral-700">
              {partners.subtitle}
            </p>

            <RangDivider />

            <div className="max-w-5xl">
              <SponsorsStrip items={partners.items} />
            </div>

            {partners.ctaLine ? (
              <p className="mt-4 max-w-5xl font-body text-[15px] leading-7 text-neutral-800">
                {partners.ctaLine}
              </p>
            ) : null}
          </section>
        </div>

        <style jsx global>{`
          .sponsor-marquee-track {
            animation: sponsorMarquee 30s linear infinite;
          }

          .group:hover .sponsor-marquee-track {
            animation-play-state: paused;
          }

          @keyframes sponsorMarquee {
            0% {
              transform: translateX(0%);
            }

            100% {
              transform: translateX(-33.333%);
            }
          }
        `}</style>
      </main>
    </PageBackground>
  );
}
