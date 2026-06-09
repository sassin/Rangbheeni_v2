"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Product = {
  id: string;
  name: string;
  category?: string;
  short?: string;
  images?: string[];
  featured?: boolean;
};

type ProductsData =
  | Product[]
  | {
      pageTitle?: string;
      intro?: string;
      items?: Product[];
    };

function RangDivider() {
  return (
    <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)] opacity-90" />
  );
}

function getItems(data: ProductsData): Product[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) return data.items;
  return [];
}

function ProductCard({ p, index }: { p: Product; index: number }) {
  const img = (p.images && p.images[0]) || "/images/placeholder.jpg";

  return (
    <motion.div 
      // Mobile Interaction: Scroll reveal
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative block transition-all duration-500 min-w-[78vw] sm:min-w-[72vw] md:min-w-0"
    >
      {/* 1. IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/5 bg-neutral-100 shadow-sm active:scale-[0.98] transition-transform">
        <Image
          src={img}
          alt={p.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        
        {/* TEXTILE GRAIN OVERLAY */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none opacity-[0.06] mix-blend-multiply" 
          style={{ 
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, #000 3px)`,
            backgroundSize: '4px 4px'
          }}
        />

        {/* 2. REVEAL LAYER */}
        <div 
          className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-8 
                     bg-gradient-to-t from-[var(--color-brown)]/70 via-transparent to-transparent 
                     transition-opacity duration-500 
                     md:opacity-0 md:group-hover:opacity-100">
          <div className="space-y-2 translate-y-0 transition-transform duration-500 md:translate-y-4 md:group-hover:translate-y-0">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-lightgreen)] drop-shadow-md">
               {p.category || "Upcycled"}
             </span>
             
             <div className="w-12 h-px border-t border-dashed border-white/40" />

             <p className="font-body text-xs text-white leading-relaxed line-clamp-3 italic opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity delay-100">
               {p.short}
             </p>
          </div>
        </div>
      </div>

      {/* 3. STATIC NAME AREA */}
      <Link href="/products" className="mt-5 px-1 flex items-start justify-between group/link">
        <div className="flex-1">
          <h3 className="font-heading text-xl font-bold text-[var(--color-brown)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
            {p.name}
          </h3>
          <div className="mt-1 h-[2px] w-8 bg-[var(--color-lightgreen)] transition-all duration-500 group-hover:w-full" />
        </div>
        
        <div className="text-[var(--color-primary)] mt-1 transition-all duration-300 md:opacity-0 md:-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FeaturedProducts({ products }: { products: ProductsData }) {
  const items = getItems(products);
  const featured = items.filter((p) => p.featured);
  const pick = (featured.length ? featured : items).slice(0, 4);

  return (
    <section className="relative py-24 bg-transparent overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-16">
          <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-5xl tracking-tight">
            Products with <span className="text-[var(--color-primary)]">Purpose</span>
          </h2>
          <p className="mt-4 font-body text-neutral-800 max-w-2xl text-lg leading-relaxed">
            Built from pre-loved textiles made for daily use, gifting, and exhibitions.
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

        {/* Mobile: Swipeable Carousel | Desktop: Standard Grid */}

        <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-12 overflow-x-auto px-6 -mx-6 pb-8 md:pb-0 no-scrollbar snap-x snap-mandatory">
          {pick.map((p, i) => (
            <div 
              key={p.id} 
              className="snap-center shrink-0 w-[85vw] md:w-auto"
            >
              <ProductCard p={p} index={i} />
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-20 flex justify-center">
          <Link
            href="/products"
            className="group relative px-10 py-4 rounded-xl font-heading text-[11px] font-black tracking-[0.3em] text-[var(--color-brown)] border-2 border-[var(--color-brown)]/10 transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 active:scale-95"
          >
            DISCOVER THE COLLECTION
          </Link>
        </div>
      </div>
    </section>
  );
}