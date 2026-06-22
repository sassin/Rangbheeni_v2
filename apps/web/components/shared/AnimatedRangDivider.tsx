"use client";

import { motion } from "framer-motion";

type AnimatedRangDividerProps = {
  className?: string;
};

export default function AnimatedRangDivider({ className = "" }: AnimatedRangDividerProps) {
  return (
    <div className={["mt-5 h-1 w-32 overflow-hidden rounded-full bg-black/10", className].join(" ")}>
      <motion.div
        initial={{ scaleX: 0, transformOrigin: "left" }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="h-full w-full rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)]"
      />
    </div>
  );
}
