"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { catalogueContent } from "@/content/pages/catalogue";

export function CatalogueSwatchSelector() {
  const [activeKey, setActiveKey] = useState(catalogueContent[0].key);
  const active = catalogueContent.find((item) => item.key === activeKey)!;

  return (
    <div className="mt-12 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
      {/* Swatch rail */}
      <div className="flex gap-4 lg:flex-col">
        {catalogueContent.map((item) => {
                const isActive = item.key === activeKey;

                return (
                <button
                    key={item.key}
                    onClick={() => setActiveKey(item.key)}
                    className="group relative flex-1 lg:flex-none overflow-hidden rounded-[0.9rem] border border-[var(--rang-accent)]/10 bg-white/50 px-3 py-2 text-left backdrop-blur-sm"
                >
                    {/* Active highlight */}
                    {isActive && (
                    <motion.div
                        layoutId="activeCatalogueSwatch"
                        className="absolute inset-0 rounded-[0.9rem] bg-white/80 shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                    )}

                    {/* Accent line */}
                    <motion.div
                    className="absolute left-0 top-0 h-full w-[3px]"
                    animate={{
                        backgroundColor: item.accent,
                        opacity: isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.25 }}
                    />

                    {/* Label */}
                    <div className="relative z-10 pl-2">
                    <p className="font-heading text-[12px] font-bold leading-tight text-[var(--rang-accent)]">
                        {item.title}
                    </p>
                    </div>
                </button>
                );
            })}
        </div>

      {/* Preview panel */}
      <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--rang-accent)]/10 bg-white/60 p-4 shadow-sm backdrop-blur-sm md:p-3">
        {/* Accent bar */}
        <motion.div
          key={active.key}
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(to right, ${active.accent}, transparent 70%)`,
          }}
          initial={{ scaleX: 0.6, opacity: 0.4 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
        />

        {/* Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: active.texture, backgroundSize: "6px 6px" }}
        />

        {/* Animated content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.28 }}
            className="relative z-10"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.18em] text-[var(--rang-primary)]/70">
                  {active.label}
                </p>

                <h3 className="mt-2 font-heading text-2xl font-bold text-[var(--rang-accent)]">
                  {active.title}
                </h3>

                <div className="mt-3 h-px w-16 border-t border-dashed border-[var(--rang-accent)]/25" />

                <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-neutral-700">
                  {active.description}
                </p>
              </div>

              <Link
                href={active.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center rounded-full border border-[var(--rang-accent)]/10 bg-[var(--rang-linen)] px-4 py-3 font-body text-sm font-semibold text-[var(--rang-accent)] transition hover:-translate-y-0.5 hover:border-[var(--rang-primary)]/25 hover:bg-white"
              >
                Open catalogue
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}