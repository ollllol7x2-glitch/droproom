import {
  ArrowRight,
  CookingPot,
  DeviceMobile,
  Lamp,
  Notebook,
  PuzzlePiece,
  TShirt,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { ProductRail } from "@/components/commerce/ProductRail";
import { GiftFinder } from "@/components/home/GiftFinder";
import { Hero } from "@/components/home/Hero";
import { ReadySet } from "@/components/home/ReadySet";
import { categories, getProductsByIds, products } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";

const categoryIcons = {
  stationery: Notebook,
  digital: DeviceMobile,
  room: Lamp,
  fashion: TShirt,
  living: CookingPot,
  hobby: PuzzlePiece,
};

export default function Home() {
  const newItems = products.filter((item) => item.badges.includes("NEW")).slice(0, 8);
  const weeklyItems = getProductsByIds(["p06", "p02", "p03"]);
  const [weeklyFeature, ...weeklySide] = weeklyItems;

  return (
    <>
      <Hero />

      <section className="drop-promo" id="weekly-drop">
        <div className="shell drop-promo-head">
          <h2>이번 주 드롭</h2>
          <p>새롭게 입점한 세 가지 아이템을 먼저 만나보세요.</p>
        </div>
        {weeklyFeature && (
          <div className="shell drop-promo-grid">
            <article className="drop-feature">
              <Link className="drop-feature-image" href={`/product/${weeklyFeature.slug}`}>
                <Image src={assetPath(weeklyFeature.image)} alt={`${weeklyFeature.name} 제품 이미지`} fill sizes="(max-width: 767px) 100vw, 58vw" style={{ objectFit: "cover", objectPosition: weeklyFeature.imagePosition }} />
              </Link>
              <div className="drop-feature-info">
                <span>{weeklyFeature.brand}</span>
                <h3>{weeklyFeature.name}</h3>
                <p>{weeklyFeature.shortDescription}</p>
                <strong>{formatPrice(weeklyFeature.salePrice ?? weeklyFeature.price)}</strong>
                <Link href={`/product/${weeklyFeature.slug}`}>상품 보기 <ArrowRight size={17} /></Link>
              </div>
            </article>
            <div className="drop-side-list">
              {weeklySide.map((item) => (
                <article key={item.id}>
                  <Link className="drop-side-image" href={`/product/${item.slug}`}>
                    <Image src={assetPath(item.image)} alt={`${item.name} 제품 이미지`} fill sizes="(max-width: 767px) 36vw, 18vw" style={{ objectFit: "cover", objectPosition: item.imagePosition }} />
                  </Link>
                  <div>
                    <span>{item.brand}</span>
                    <h3>{item.name}</h3>
                    <strong>{formatPrice(item.salePrice ?? item.price)}</strong>
                    <Link href={`/product/${item.slug}`} aria-label={`${item.name} 상품 보기`}><ArrowRight size={18} /></Link>
                  </div>
                </article>
              ))}
              <Link className="drop-all-link" href="/shop?sort=drop">드롭 전체 보기 <ArrowRight size={18} /></Link>
            </div>
          </div>
        )}
      </section>

      <section className="category-section">
        <div className="shell section-heading">
          <h2>카테고리 바로가기</h2>
          <p>오늘의 취향에 맞는 물건부터 빠르게 둘러보세요.</p>
        </div>
        <div className="shell category-icon-grid">
          {categories.map((category) => {
            const Icon = categoryIcons[category.key];
            return (
              <Link
                className={`category-icon-link category-icon-link-${category.key}`}
                key={category.key}
                href={`/shop?category=${category.key}`}
                aria-label={`${category.korean} 카테고리: ${category.description}`}
              >
                <span className="category-icon-circle" aria-hidden="true">
                  <Icon size={32} weight="regular" />
                </span>
                <strong>{category.korean}</strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="new-section">
        <div className="shell product-section-head">
          <div><h2>이번 주 신상품</h2><p>서로 다른 촬영과 색감으로 상품을 더 정확하게 보여드립니다.</p></div>
          <Link className="text-link" href="/shop?sort=new">신상품 전체 <ArrowRight size={17} /></Link>
        </div>
        <ProductRail items={newItems} />
      </section>

      <GiftFinder />
      <ReadySet />
    </>
  );
}
