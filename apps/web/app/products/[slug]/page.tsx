import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import { CardImage } from "@/components/CardImage";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return notFound();
  return (
    <main>
      <section className="container page-header two-column">
        <div>
          <p className="eyebrow">{product.category?.label ?? "Product"}</p>
          <h1 className="page-title">{product.name}</h1>
          <p className="lead">{product.shortDescription}</p>
          <div className="divider" />
          <Link className="button primary" href="mailto:enquiries.rangbheeni@gmail.com">Enquire about this product</Link>
        </div>
        <div className="card"><CardImage src={product.images[0]?.url} alt={product.name} /></div>
      </section>
      <section className="section">
        <div className="container two-column">
          <div className="rich-text">
            <h2>{product.storyTitle ?? "Product story"}</h2>
            <p>{product.story ?? product.longDescription ?? product.shortDescription}</p>
          </div>
          <div className="rich-text">
            <h2>Contact</h2>
            <p>For availability, pricing, bulk gifting, or custom collaboration questions, contact Rangbheeni directly.</p>
            <p><a className="button" href="mailto:enquiries.rangbheeni@gmail.com">enquiries.rangbheeni@gmail.com</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}
