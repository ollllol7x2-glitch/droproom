import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { ProductPurchase } from "@/components/commerce/ProductPurchase";
import { ProductQuestions } from "@/components/commerce/ProductQuestions";
import { ProductReviews } from "@/components/commerce/ProductReviews";
import { categories, getProduct, products, type CategoryKey } from "@/data/products";
import { assetPath } from "@/lib/assets";

const categoryIntroductions: Record<CategoryKey, { title: string; scene: string }> = {
  stationery: {
    title: "쓰는 시간이 조금 더 좋아지도록",
    scene: "매일 펼치는 노트와 필기구 곁에 두고, 기록을 시작하는 작은 신호로 사용해 보세요.",
  },
  digital: {
    title: "자주 쓰는 기기 곁에 필요한 변화",
    scene: "통학과 출근, 책상과 가방 사이를 오갈 때 디지털 생활의 작은 불편을 줄여줍니다.",
  },
  room: {
    title: "작은 물건 하나로 달라지는 방의 표정",
    scene: "침대 옆이나 책상 위, 시선이 자주 머무는 자리에 두어 공간의 중심을 만들어 보세요.",
  },
  fashion: {
    title: "매일의 옷에 더하는 가벼운 포인트",
    scene: "평소 자주 입는 옷과 가방에 자연스럽게 섞어, 부담 없이 오늘의 색을 더해 보세요.",
  },
  living: {
    title: "손이 자주 가는 생활 도구의 기준",
    scene: "식탁과 책상처럼 매일 사용하는 자리에 두고, 익숙한 생활 장면을 더 편하게 만들어 보세요.",
  },
  hobby: {
    title: "화면 밖에서 손으로 쉬는 시간",
    scene: "잠깐 집중하고 싶을 때 꺼내어, 짧은 시간이라도 손을 움직이는 휴식을 시작해 보세요.",
  },
};

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
  const category = categories.find((item) => item.key === product.category);
  const introduction = categoryIntroductions[product.category];

  return (
    <div className="detail-page">
      <div className="shell detail-grid">
        <div className="detail-gallery">
          <div className="detail-main-image"><Image src={assetPath(product.image)} alt={`${product.name} 제품 이미지`} fill preload sizes="(max-width: 860px) 100vw, 55vw" style={{ objectFit: "cover", objectPosition: product.imagePosition }} /></div>
          <div className="detail-support-grid">
            <div><Image src={assetPath(product.image)} alt={`${product.name} 소재와 형태 디테일`} fill sizes="30vw" style={{ objectFit: "cover", objectPosition: "20% 60%" }} /></div>
            <div><Image src={assetPath(product.image)} alt={`${product.name} 사용 장면`} fill sizes="30vw" style={{ objectFit: "cover", objectPosition: "80% 42%" }} /></div>
          </div>
        </div>
        <ProductPurchase product={product} />
      </div>
      <nav className="product-detail-tabs" aria-label="상품 상세 메뉴">
        <div className="shell product-detail-tabs-inner">
          <a href="#product-introduction">상품 소개</a>
          <a href="#product-reviews">리뷰</a>
          <a href="#product-questions">Q&amp;A</a>
          <a href="#related-products">관련 상품</a>
        </div>
      </nav>
      <section className="shell product-introduction" id="product-introduction" aria-labelledby="product-introduction-title">
        <div className="product-introduction-heading">
          <p>PRODUCT INTRODUCTION</p>
          <h2 id="product-introduction-title">{introduction.title}</h2>
        </div>
        <div className="product-introduction-grid">
          <figure className="product-introduction-visual">
            <div>
              <Image
                src={assetPath(product.image)}
                alt={`${product.name}의 색과 형태를 보여주는 제품 소개 이미지`}
                fill
                sizes="(max-width: 900px) 100vw, 52vw"
                style={{ objectFit: "cover", objectPosition: product.imagePosition }}
              />
            </div>
            <figcaption>{product.brand} · {product.name}</figcaption>
          </figure>
          <div className="product-introduction-copy">
            <p className="product-introduction-lead">{product.shortDescription}</p>
            <p>{product.curatorNote}</p>
            <dl>
              <div><dt>BRAND</dt><dd>{product.brand}</dd></div>
              <div><dt>CATEGORY</dt><dd>{category?.korean ?? product.category}</dd></div>
              <div><dt>COLOR</dt><dd>{product.colors.join(" · ")}</dd></div>
            </dl>
            <div className="product-use-note">
              <h3>이렇게 써보세요</h3>
              <p>{introduction.scene}</p>
            </div>
          </div>
        </div>
      </section>
      <ProductReviews productSlug={product.slug} productName={product.name} category={product.category} colors={product.colors} />
      <ProductQuestions productSlug={product.slug} productName={product.name} />
      <section className="shell related-section" id="related-products" aria-labelledby="related-products-title">
        <div className="product-section-head">
          <div>
            <h2 id="related-products-title">같이 두기 좋은 물건</h2>
            <p>같은 카테고리에서 함께 고른 제품입니다.</p>
          </div>
        </div>
        {related.length > 0 ? <ProductGrid items={related} /> : <p className="related-empty">현재 함께 추천할 상품을 준비하고 있습니다.</p>}
      </section>
    </div>
  );
}
