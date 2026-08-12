"use client";

import { Heart } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/commerce/StoreProvider";
import type { Product } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const wishlisted = isWishlisted(product.id);
  const price = product.salePrice ?? product.price;

  const add = () => {
    addToCart(product.id);
    setAdded(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setAdded(false), 1200);
  };

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  return (
    <article className="product-card">
      <div className="product-media">
        <Link href={`/product/${product.slug}`} aria-label={`${product.name} 상세 보기`}>
          <Image
            src={assetPath(product.image)}
            alt={`${product.name} 제품 이미지`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: "cover", objectPosition: product.imagePosition }}
          />
        </Link>
        <button
          className={`wish-button ${wishlisted ? "active" : ""}`}
          type="button"
          aria-label={wishlisted ? `${product.name} 찜 해제` : `${product.name} 찜하기`}
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart size={19} weight={wishlisted ? "fill" : "regular"} />
        </button>
      </div>
      <div className="product-meta">
        <div className="product-badges" aria-label="상품 표시">
          {product.badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
        <Link href={`/product/${product.slug}`}>
          <span className="product-brand">{product.brand}</span>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-price-row">
          <div>
            {product.salePrice && <del>{formatPrice(product.price)}</del>}
            <strong>{formatPrice(price)}</strong>
          </div>
          <button className="product-cart-button" type="button" onClick={add} aria-label={`${product.name} 장바구니 담기`}>
            <span className="added-label">{added ? "담았어요" : "장바구니"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
