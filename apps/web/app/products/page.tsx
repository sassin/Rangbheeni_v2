import Link from "next/link";
import { getProducts } from "@/lib/api";
import { CardImage } from "@/components/CardImage";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts().catch(() => []);

  const groups = new Map<string, typeof products>();

  for (const product of products) {
    const label = product.category?.label ?? "Other";
    groups.set(label, [...(groups.get(label) ?? []), product]);
  }

  return (
    <main>
      <header className="mx-auto w-[min(1280px,calc(100%-32px))] pt-20 pb-10">
        <p className="eyebrow">Our Products</p>
        <h1 className="page-title">Our Products</h1>
        <p className="lead max-w-3xl">
          Made from pre-loved textiles and crafted by women building dignified,
          climate-resilient livelihoods.
        </p>
        <div className="divider" />
      </header>

      <div className="mx-auto w-[min(1280px,calc(100%-32px))] pb-20">
        {[...groups.entries()].map(([category, items], index) => (
          <section
            className={[
              "py-12",
              index === 0 ? "border-t border-[var(--rang-border)]" : "",
              "border-b border-[var(--rang-border)]",
            ].join(" ")}
            key={category}
          >
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Category</p>
                <h2 className="font-heading text-[clamp(2rem,4vw,3.6rem)] leading-[0.96] tracking-[-0.06em] text-[var(--rang-accent)]">
                  {category}
                </h2>
              </div>
              <p className="font-body text-sm text-neutral-600">
                {items.length} {items.length === 1 ? "product" : "products"}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((product) => (
                <Link
                  className="card overflow-hidden"
                  href={`/products/${product.slug}`}
                  key={product.id}
                >
                  <CardImage src={product.images[0]?.url} alt={product.name} />
                  <div className="card-body">
                    <span className="tag">
                      {product.category?.label ?? "Product"}
                    </span>
                    <h3>{product.name}</h3>
                    <p>{product.shortDescription}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
