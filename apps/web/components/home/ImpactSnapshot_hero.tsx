"use client";

import { useMemo } from "react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";

type ImpactStat = {
  label: string;
  value: string;
};

type ImpactData = {
  stats: ImpactStat[];
};

function TactileSwatch({ s }: { s: ImpactStat }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleUpdate = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    x.set((clientX - rect.left) / rect.width - 0.5);
    y.set((clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleUpdate(e.clientX, e.clientY, e.currentTarget);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    handleUpdate(touch.clientX, touch.clientY, e.currentTarget);
  };

  const onReset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onReset}
      onTouchMove={onTouchMove}
      onTouchEnd={onReset}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="group relative text-left rounded-2xl border border-black/5 bg-white p-5 shadow-sm
                 transition-shadow hover:shadow-xl [perspective:1000px] touch-none"
    >
      <div 
        className=" absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity" 
        style={{ 
          backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)`, 
          backgroundSize: '8px 8px' 
        }}
      />

      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 w-full px-1">
        <div className="font-heading text-xl font-bold text-[var(--color-primary)]">
          <span className="relative inline-block">
            {s.value}
            <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[var(--color-lightgreen)]/70" />
          </span>
        </div>
        <div className="mt-1 font-body text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">
          {s.label}
        </div>
      </div>
    </motion.div>
  );
}

function RangDivider() {
  return (
    <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)] opacity-90" />
  );
}

export default function ImpactSnapshot({
  impact,
}: {
  impact: ImpactData;
}) {
  const stats = impact?.stats || [];

  return (
    <section className="relative">
      <div className="bg-[rgba(132,188,65,0.10)] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-5xl tracking-tight">
            Community <span className="text-[var(--color-primary)]">Impact</span>
            </h2>
              <p className="mt-2 font-body text-neutral-700 max-w-3xl">
                Climate action, livelihoods, and education measured in real outcomes
              </p>

              <motion.div 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="origin-left"
              >
                <RangDivider />
              </motion.div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 [perspective:1000px]">
            {stats.map((s) => (
              <TactileSwatch key={s.label} s={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}