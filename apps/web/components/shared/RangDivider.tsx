import { motion } from "framer-motion";

export default function RangDivider({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className={`origin-left ${className}`}
    >
      <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)] opacity-90" />
    </motion.div>
  );
}
