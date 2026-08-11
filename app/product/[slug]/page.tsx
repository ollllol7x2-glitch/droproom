import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { ProductPurchase } from "@/components/commerce/ProductPurchase";
import { getProduct, products } from "@/data/products";
import { assetPath } from "@/lib/assets";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return product ? { title: product.name, description: product.shortDescription } : { title: "상품을 찾을 수 없음" };
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <div className="detail-page">
      <div className="shell back-row"><Link href="/shop"><ArrowLeft size={17} /> 상품 목록</Link></div>
      <div className="shell detail-grid">
        <div className="detail-gallery">
          <div className="detail-main-image"><Image src={assetPath(product.image)} alt={`${product.name} 제품 이미지`} fill priority sizes="(max-width: 860px) 100vw, 55vw" style={{ objectFit: "cover", objectPosition: product.imagePosition }} /></div>
          <div className="detail-support-grid">
            <div><Image src={assetPath(product.image)} alt={`${product.name} 소재와 형태 디테일`} fill sizes="30vw" style={{ objectFit: "cover", objectPosition: "20% 60%" }} /></div>
            <div><Image src={assetPath(product.image)} alt={`${product.name} 사용 장면`} fill sizes="30vw" style={{ objectFit: "cover", objectPosition: "80% 42%" }} /></div>
          </div>
        </div>
        <ProductPurchase product={product} />
      </div>
      {related.length > 0 && <section className="shell related-section"><div className="product-section-head"><div><h2>같이 두기 좋은 물건</h2><p>같은 카테고리에서 함께 고른 제품입니다.</p></div></div><ProductGrid items={related} /></section>}
    </div>
  );
}
