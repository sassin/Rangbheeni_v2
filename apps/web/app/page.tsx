import Hero from "@/components/hero/Hero";
import ImpactSnapshot from "@/components/home/ImpactSnapshot_hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CorporateCollab from "@/components/home/CorporateCollab";
import FinalCTA from "@/components/home/FinalCTA";
import PageBackground from "@/components/layout/PageBackground";
import { getPage, getProducts } from "@/lib/api";
import { toLegacyProductsCollection } from "@/lib/adapters";
import { fallbackImpact } from "@/lib/fallbackContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, impactPage] = await Promise.all([
    getProducts().catch(() => []),
    getPage<any>("impact").catch(() => null),
  ]);

  const productsCollection = toLegacyProductsCollection(products);
  const impactCollection = impactPage?.content ?? fallbackImpact;

  return (
    <PageBackground variant="linen">
      <div className="relative z-10">
        <Hero />
        <ImpactSnapshot impact={impactCollection as any} />
        <FeaturedProducts products={productsCollection.items as any} />
        <CorporateCollab />
        <FinalCTA />
      </div>
    </PageBackground>
  );
}
