"use client";

import { motion } from "framer-motion";
import ProductsShowcase from "@/components/products/ProductsShowcase";
import PageBackground from "@/components/layout/PageBackground";
import RangDivider from "@/components/shared/RangDivider";
import { CatalogueSwatchSelector } from "@/components/products/CatalogueSwatchSelector";

type ProductsPageData = {
  pageTitle?: string;
  intro?: string;
  items: any[];
};

const easeCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];

function DenimTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-brand-mesh" />
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ filter: "url(#denimWeave)" }}
      />
      <div className="absolute inset-0 opacity-[0.05] bg-denim-twill" />
      <div className="absolute inset-0 opacity-[0.03] bg-weave" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_14%,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_78%_12%,rgba(9,158,200,0.08),transparent_20%),radial-gradient(circle_at_76%_78%,rgba(132,188,65,0.08),transparent_22%)]" />
    </div>
  );
}

export default function ProductsPageClient({ data }: { data: ProductsPageData }) {
  return (
    <PageBackground variant="jute">
      <main className="relative min-h-screen overflow-x-hidden bg-[#efeeea] text-[var(--color-brown)]">
        <DenimTexture />

        <div className="relative z-10 md:pr-80 lg:pl-65">
          <section className="mx-auto max-w-5xl px-6 pt-28 md:pt-32">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: easeCurve }}
              className="max-w-5xl"
            >
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">
                {data.pageTitle ?? "Products"}
              </h1>

              {data.intro ? (
                <p className="mt-2 max-w-3xl font-body text-[var(--rang-primary)]">
                  {data.intro}
                </p>
              ) : null}

              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="origin-left"
              >
                <RangDivider />
              </motion.div>
            </motion.div>
          </section>

          <section className="mx-auto max-w-5xl px-6 py-10 md:py-16">
            <ProductsShowcase products={data.items} />
          </section>

          <section className="mx-auto max-w-5xl border-t border-black/10 px-6 pb-10 pt-4 md:pb-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: easeCurve }}
            >
              <h2 className="mt-4 font-heading text-5xl font-bold leading-[1.1] tracking-tighter text-[var(--rang-accent)] md:text-5xl lg:text-5xl">
                Product catalogue
              </h2>

              <p className="mt-2 max-w-5xl font-body leading-5 text-neutral-700">
                For corporate gifting, exhibitions, or bulk collaborations, download the Rangbheeni catalogue.
              </p>

              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="origin-left"
              >
                <RangDivider />
              </motion.div>

              <CatalogueSwatchSelector />
            </motion.div>
          </section>
        </div>
      </main>
    </PageBackground>
  );
}

