"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import RangDivider from "@/components/shared/RangDivider";

type PageHeroRevealProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
};

export default function PageHeroReveal({
  eyebrow,
  title,
  description,
}: PageHeroRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <p className="font-body text-xs uppercase tracking-[0.28em] text-[var(--color-primary)]">
        {eyebrow}
      </p>

      <h1 className="mt-4 max-w-5xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-brown)] md:text-6xl">
        {title}
      </h1>

      {description ? (
        <div className="mt-6 max-w-4xl font-body text-base leading-8 text-neutral-800 md:text-lg">
          {description}
        </div>
      ) : null}

      <RangDivider />
    </motion.div>
  );
}
