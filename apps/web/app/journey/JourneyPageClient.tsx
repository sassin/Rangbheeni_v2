"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import DenimTexture from "@/components/shared/DenimTexture";
import RangDivider from "@/components/shared/RangDivider";
import PageBackground from "@/components/layout/PageBackground";
import ImpactSnapshot from "@/components/home/ImpactSnapshot";

function getArtisanStoryParagraphs(artisan: any) {
  const structured =
    artisan?.storyParagraphs ??
    artisan?.experienceParagraphs ??
    artisan?.narrativeParagraphs;

  if (Array.isArray(structured)) {
    return structured
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  const value =
    artisan?.story ??
    artisan?.experience ??
    artisan?.narrative ??
    artisan?.bio ??
    artisan?.description ??
    artisan?.text ??
    "";

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  return value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getArtisanStory(artisan: any) {
  return getArtisanStoryParagraphs(artisan).join("\n\n");
}

function ArtisanPhotoTile({
  artisan,
  index,
  onOpen,
}: {
  artisan: any;
  index: number;
  onOpen: () => void;
}) {
  const rotations = [-1.2, 0.8, -0.6, 1.1, 0.4, -0.9];
  const rotate = rotations[index % rotations.length];

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${artisan.name}'s story`}
      className="group relative block text-left outline-none"
      initial={{ opacity: 0, y: 24, rotate: rotate + 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.045,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -8,
        rotate: 0,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <motion.div
        layoutId={`artisan-image-${index}`}
        className="relative aspect-[3/4] overflow-hidden rounded-[1.45rem] bg-neutral-200 shadow-[0_14px_36px_rgba(72,49,29,0.13)]"
      >
        <motion.img
          src={artisan.photo}
          alt={artisan.name}
          className="h-full w-full object-cover grayscale-[0.18] transition duration-700 group-hover:scale-[1.045] group-hover:grayscale-0"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, #000 3px)",
            backgroundSize: "4px 4px",
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/8 to-transparent opacity-55 transition-opacity duration-500 group-hover:opacity-85" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <motion.div
            initial={false}
            className="translate-y-2 transition-transform duration-500 group-hover:translate-y-0"
          >
            <p className="font-heading text-base font-bold leading-tight text-white">
              {artisan.name}
            </p>

            {artisan.location ? (
              <p className="mt-1 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-white/65">
                {artisan.location}
              </p>
            ) : null}

            {artisan.quote ? (
              <p className="mt-3 line-clamp-4 translate-y-2 font-body text-[11px] italic leading-relaxed text-white/88 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                “{artisan.quote}”
              </p>
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </motion.button>
  );
}

function ArtisanStoryOverlay({
  artisan,
  index,
  onClose,
}: {
  artisan: any;
  index: number;
  onClose: () => void;
}) {
  const paragraphs = getArtisanStoryParagraphs(artisan);
  const storyTitle = artisan?.storyTitle || artisan?.experienceTitle || "Artisan story";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-y-auto bg-[#18110b]/72 px-5 py-6 backdrop-blur-xl md:px-10 md:py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={`${artisan.name}'s story`}
      onClick={onClose}
    >
      <div
        className="mx-auto grid min-h-[calc(100dvh-3rem)] max-w-6xl items-center gap-8 md:min-h-[calc(100dvh-5rem)] lg:grid-cols-[0.92fr_1.08fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          layoutId={`artisan-image-${index}`}
          className="relative min-h-[55vh] overflow-hidden rounded-[2rem] bg-neutral-200 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:min-h-[68vh]"
        >
          <img
            src={artisan.photo}
            alt={artisan.name}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/52 via-black/8 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-white/65">
              {storyTitle}
            </p>
            <h3 className="mt-3 font-heading text-4xl font-bold leading-none text-white md:text-5xl">
              {artisan.name}
            </h3>
            {artisan.location ? (
              <p className="mt-3 font-body text-xs font-bold uppercase tracking-[0.22em] text-white/65">
                {artisan.location}
              </p>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 12, filter: "blur(5px)" }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur transition hover:bg-white/18 hover:text-white"
          >
            <span aria-hidden="true">×</span>
            Close
          </button>

          {artisan.quote ? (
            <blockquote className="border-l-2 border-[var(--rang-secondary)]/80 pl-6 font-heading text-2xl font-semibold italic leading-snug text-white md:text-3xl">
              “{artisan.quote}”
            </blockquote>
          ) : null}

          {paragraphs.length > 0 ? (
            <div className="mt-8 space-y-5 font-body text-base leading-8 text-white/78 md:text-lg md:leading-9">
              {paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="mt-8 max-w-2xl font-body text-base leading-8 text-white/72 md:text-lg">
              This artisan’s full story is being prepared. For now, this space highlights their photograph, location, and voice from the Rangbheeni journey.
            </p>
          )}

          <div className="mt-10 h-px w-full bg-gradient-to-r from-[var(--rang-secondary)]/60 via-white/18 to-transparent" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function JourneyPageClient({
  content,
  impact,
}: {
  content: any;
  impact: any;
}) {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [openArtisanIndex, setOpenArtisanIndex] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const pathLength = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });

  const artisans = content.artisans.items ?? [];
  const openArtisan =
    openArtisanIndex === null ? null : artisans[openArtisanIndex] ?? null;

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.05) {
        setActiveMilestone(null);
        setShowCard(false);
        return;
      }

      const index = Math.min(
        Math.floor(latest * content.timeline.items.length),
        content.timeline.items.length - 1
      );

      setActiveMilestone(index);
      setShowCard(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowCard(false), 3000);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content.timeline.items.length, scrollYProgress]);

  const wavyPath = "M 10 0 Q 30 150 10 300 Q -10 450 10 600 Q 30 750 10 900";

  return (
    <PageBackground variant="paper">
      <main
        ref={containerRef}
        className="relative bg-[#efeeea] text-[var(--rang-accent)] selection:bg-[var(--rang-primary)] selection:text-white"
      >
        <DenimTexture />

        <aside className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-black/5 py-24 md:w-24">
          <svg
            width="40"
            height="100%"
            viewBox="0 0 20 900"
            preserveAspectRatio="none"
            className="mt-10 h-[70vh] opacity-20"
          >
            <path
              d={wavyPath}
              fill="none"
              stroke="black"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
            <motion.path
              d={wavyPath}
              fill="none"
              stroke="var(--rang-primary)"
              strokeWidth="2"
              style={{ pathLength }}
              className="drop-shadow-[0_0_8px_var(--rang-primary)]"
            />
          </svg>

          <div
            className="absolute left-full ml-2 w-[9.5rem] md:w-[10.5rem]"
            style={{
              top:
                activeMilestone !== null
                  ? `${25 + activeMilestone * 5}vh`
                  : "20vh",
            }}
          >
            <AnimatePresence>
              {showCard && activeMilestone !== null ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-[0.8rem] border border-black/5 bg-white/20 px-2.5 py-2 shadow-[0_6px_18px_rgba(0,0,0,0.05)] backdrop-blur-sm"
                >
                  <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-[var(--rang-primary)]/80">
                    {content.timeline.items[activeMilestone].year}
                  </span>
                  <h4 className="mt-[2px] text-[10px] font-medium uppercase leading-tight text-[var(--rang-accent)]/85">
                    {content.timeline.items[activeMilestone].title}
                  </h4>
                  <div className="mt-1.5 h-px w-6 bg-[var(--rang-primary)]/15 transition-all duration-300 group-hover:w-10" />
                  <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-32 group-hover:opacity-100">
                    <p className="mt-1.5 text-[9px] leading-[1.5] text-neutral-600/85">
                      {content.timeline.items[activeMilestone].text}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </aside>

        <div className="relative z-10 pl-24 pr-8 md:pl-52 md:pr-20 lg:pl-72">
          <section className="flex min-h-[90vh] max-w-5xl flex-col justify-center py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">
                {content.origin.title}
              </h1>
              <RangDivider />
              <div className="mt-16 grid gap-16 text-justify md:grid-cols-2">
                <div className="space-y-8 text-base font-medium leading-relaxed text-neutral-800 md:text-lg">
                  <p>{content.origin.paragraphs[0]}</p>
                  <p className="border-l-2 border-[var(--rang-secondary)] pl-6 text-sm italic leading-relaxed text-neutral-500 md:text-base">
                    {content.origin.paragraphs[1]}
                  </p>
                </div>
                <div className="space-y-8 text-sm leading-relaxed text-neutral-500">
                  <p>{content.origin.paragraphs[2]}</p>
                  <p className="text-lg font-bold leading-tight text-[var(--rang-primary)]">
                    {content.origin.paragraphs[3]}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          <section className="flex max-w-5xl flex-col justify-center border-t border-black/10 py-16">
            <ImpactSnapshot impact={impact} enableGlobalDetailsModal />
          </section>

          <section className="relative max-w-5xl border-t border-black/10 py-16">
            <div className="mb-14">
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">
                {content.artisans.title}
              </h1>
              <p className="mt-2 font-body text-[var(--rang-primary)]">
                {content.artisans.subtitle}
              </p>
              <RangDivider />
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-4">
              {artisans.map((artisan: any, index: number) => (
                <ArtisanPhotoTile
                  key={`${artisan.name}-${index}`}
                  artisan={artisan}
                  index={index}
                  onOpen={() => setOpenArtisanIndex(index)}
                />
              ))}
            </div>
          </section>

          <section className="relative max-w-5xl border-t border-black/10 py-16">
            <div className="max-w-3xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-brown)] md:text-5xl">
                {content.next.title}
              </h2>
              <RangDivider />
              <p className="mt-8 max-w-5xl text-justify font-body text-base leading-relaxed text-neutral-700 md:text-lg">
                {content.next.text}
              </p>
            </div>
          </section>

          <div className="h-[20vh]" />
        </div>

        <AnimatePresence>
          {openArtisan && openArtisanIndex !== null ? (
            <ArtisanStoryOverlay
              artisan={openArtisan}
              index={openArtisanIndex}
              onClose={() => setOpenArtisanIndex(null)}
            />
          ) : null}
        </AnimatePresence>
      </main>
    </PageBackground>
  );
}
