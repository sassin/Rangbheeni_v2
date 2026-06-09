"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ImpactData, ImpactStat } from "@/types/home";
import RangDivider from "@/components/shared/RangDivider";

function TactileSwatch({ item, onClick }: { item: ImpactStat; onClick: () => void }) {
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

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={(event) => handleUpdate(event.clientX, event.clientY, event.currentTarget)}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onTouchMove={(event) => {
        const touch = event.touches[0];
        handleUpdate(touch.clientX, touch.clientY, event.currentTarget);
      }}
      onTouchEnd={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.02, z: 20 }}
      whileTap={{ scale: 0.95 }}
      className="group relative rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-lightgreen)]/60 [perspective:1000px] touch-none"
      aria-label={`Open details for ${item.label}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.03] transition-opacity group-hover:opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)",
          backgroundSize: "8px 8px",
        }}
      />
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 w-full px-1">
        <div className="font-heading text-xl font-bold text-[var(--color-primary)]">
          <span className="relative inline-block">
            {item.value}
            <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[var(--color-lightgreen)]/70" />
          </span>
        </div>
        <div className="mt-1 font-body text-xs text-neutral-600 transition-colors group-hover:text-neutral-900">
          {item.label}
        </div>
      </div>
    </motion.button>
  );
}

function Modal({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center px-2 py-2 md:items-center md:px-4 md:py-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(28,18,10,0.34)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.985 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-t-[1.75rem] border border-[var(--rang-accent)]/10 bg-[var(--rang-linen)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:max-h-[82vh] md:rounded-[2rem]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, #000 3px)",
            backgroundSize: "4px 4px",
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--rang-primary)] via-[var(--rang-secondary)] to-[var(--rang-highlight)]" />

        <div className="relative z-10 border-b border-[var(--rang-accent)]/8 bg-[var(--rang-linen)]/95 px-4 py-4 backdrop-blur-sm md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[var(--rang-primary)]/75">
                Impact detail
              </p>
              <h3 className="mt-2 font-heading text-xl font-bold leading-tight text-[var(--rang-accent)] md:text-2xl">
                {title}
              </h3>
              {subtitle ? (
                <p className="mt-1 max-w-2xl font-body text-sm leading-6 text-neutral-700">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="shrink-0 rounded-full border border-[var(--rang-accent)]/10 bg-white/70 px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--rang-accent)] transition hover:border-[var(--rang-primary)]/30 hover:text-[var(--rang-primary)]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="relative z-10 max-h-[78vh] overflow-y-auto px-4 py-4 md:max-h-[calc(82vh-96px)] md:px-6 md:py-5">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default function ImpactSnapshot({
  impact,
  enableGlobalDetailsModal = false,
}: {
  impact: ImpactData;
  enableGlobalDetailsModal?: boolean;
}) {
  const [selected, setSelected] = useState<ImpactStat | null>(null);
  const [globalOpen, setGlobalOpen] = useState(false);
  const hasGlobalDetails = Boolean(impact.equivalents?.length || impact.perCustomer?.length);

  return (
    <section className="relative">
      <div className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight text-[var(--rang-accent)] md:text-4xl lg:text-5xl">
              Impact
            </h1>
            <p className="max-w-3xl font-body text-neutral-700">{impact.description}</p>
            <RangDivider />
          </div>

          {enableGlobalDetailsModal && hasGlobalDetails ? (
            <button
              type="button"
              onClick={() => setGlobalOpen(true)}
              className="self-start rounded-xl bg-[var(--color-lightgreen)] px-4 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:opacity-95 md:self-auto"
            >
              View details
            </button>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 [perspective:1000px]">
          {impact.stats.map((item) => (
            <TactileSwatch key={item.label} item={item} onClick={() => setSelected(item)} />
          ))}
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected?.details?.title ?? selected?.label ?? "Impact detail"}
        subtitle={selected?.details?.subtitle}
        onClose={() => setSelected(null)}
      >
      {selected ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[1.25rem] border border-[var(--rang-accent)]/8 bg-white/70 p-4">
                <p className="font-body text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Current figure
                </p>
                <div className="mt-2 font-heading text-2xl font-bold leading-tight text-[var(--rang-primary)] md:text-[1.9rem]">
                  {selected.value}
                </div>
                <p className="mt-2 font-body text-sm leading-6 text-neutral-700">
                  {selected.label}
                </p>
              </div>

              <div className="space-y-4">
                {selected.details?.bullets?.length ? (
                  <div className="rounded-[1.25rem] border border-[var(--rang-accent)]/8 bg-white/45 p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-body text-[10px] uppercase tracking-[0.18em] text-[var(--rang-primary)]/75">
                        What this includes
                      </span>
                      <div className="h-px flex-1 border-t border-dashed border-[var(--rang-primary)]/25" />
                    </div>

                    <ul className="mt-3 grid gap-x-4 gap-y-2 font-body text-sm leading-6 text-neutral-800 md:grid-cols-2">
                      {selected.details.bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--rang-secondary)]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selected.details?.math?.length ? (
                  <div className="rounded-[1.25rem] border border-[var(--rang-accent)]/8 bg-[rgba(132,188,65,0.07)] p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-body text-[10px] uppercase tracking-[0.18em] text-[var(--rang-primary)]/75">
                        How this is estimated
                      </span>
                      <div className="h-px flex-1 border-t border-dashed border-[var(--rang-primary)]/25" />
                    </div>

                    <div className="mt-3 space-y-2 font-body text-sm leading-6 text-neutral-800">
                      {selected.details.math.map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {selected.details?.equivalents?.length ? (
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-[10px] uppercase tracking-[0.18em] text-[var(--rang-primary)]/75">
                    Everyday equivalents
                  </span>
                  <div className="h-px flex-1 border-t border-dashed border-[var(--rang-primary)]/25" />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selected.details.equivalents.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1rem] border border-[var(--rang-accent)]/8 bg-white/65 p-4"
                    >
                      <div className="font-heading text-lg font-bold leading-tight text-[var(--rang-accent)]">
                        {item.value}
                      </div>
                      <div className="mt-1 font-body text-sm leading-6 text-neutral-700">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {selected.details?.note ? (
              <div className="border-l-2 border-[var(--rang-secondary)] pl-4">
                <p className="font-body text-sm italic leading-6 text-neutral-600">
                  {selected.details.note}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={enableGlobalDetailsModal && globalOpen}
        title="Impact details"
        subtitle="Equivalents and per-customer contribution."
        onClose={() => setGlobalOpen(false)}
      >
        <div className="space-y-6">
  {impact.equivalents?.length ? (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[var(--rang-primary)]/75">
          Carbon footprint equivalents
        </span>
        <div className="h-px flex-1 border-t border-dashed border-[var(--rang-primary)]/30" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {impact.equivalents.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.25rem] border border-[var(--rang-accent)]/8 bg-white/65 p-4"
          >
            <div className="font-heading text-lg font-bold text-[var(--rang-accent)]">
              {item.value}
            </div>
            <div className="mt-1 font-body text-sm leading-6 text-neutral-700">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null}

  {impact.perCustomer?.length ? (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[var(--rang-primary)]/75">
          Each customer contributes
        </span>
        <div className="h-px flex-1 border-t border-dashed border-[var(--rang-primary)]/30" />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {impact.perCustomer.map((item) => (
          <div
            key={item.label}
            className="rounded-full border border-[var(--rang-accent)]/10 bg-white/70 px-4 py-3"
          >
            <span className="font-heading font-bold text-[var(--rang-primary)]">
              {item.value}
            </span>{" "}
            <span className="font-body text-sm text-neutral-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null}
</div>
      </Modal>
    </section>
  );
}
