import { getProducts } from "@/lib/api";
import { toLegacyProductsCollection } from "@/lib/adapters";
import ProductsPageClient from "./ProductsPageClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts().catch(() => []);
  const data = toLegacyProductsCollection(products);

  return <ProductsPageClient data={data} />;
}
