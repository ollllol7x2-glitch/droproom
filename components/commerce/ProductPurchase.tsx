"use client";

import { Bag, Check, Heart, Minus, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { useStore } from "@/components/commerce/StoreProvider";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);

  const add = () => {
    addToCart(product.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="purchase-panel">
      <div className="detail-badges">{product.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
      <p className="detail-brand">{product.brand}</p>
      <h1>{product.name}</h1>
      <p className="detail-description">{product.shortDescription}</p>
      <div className="detail-price">
        {product.salePrice && <del>{formatPrice(product.price)}</del>}
        <strong>{formatPrice(product.salePrice ?? product.price)}</strong>
      </div>

      <div className="color-row"><span>색상</span><div>{product.colors.map((color, index) => <button key={color} className={index === 0 ? "active" : ""} type="button">{color}</button>)}</div></div>

      <div className="quantity-row">
        <span>수량</span>
        <div>
          <button type="button" aria-label="수량 줄이기" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button>
          <output aria-live="polite">{quantity}</output>
          <button type="button" aria-label="수량 늘리기" onClick={() => setQuantity((value) => value + 1)}><Plus size={15} /></button>
        </div>
      </div>

      <div className="purchase-actions">
        <button className="add-button" type="button" onClick={add}>{added ? <><Check size={18} /> 담았습니다</> : <><Bag size={18} /> 장바구니 담기</>}</button>
        <button className={`detail-wish ${wishlisted ? "active" : ""}`} type="button" aria-label={wishlisted ? "찜 해제" : "찜하기"} onClick={() => toggleWishlist(product.id)}><Heart size={21} weight={wishlisted ? "fill" : "regular"} /></button>
      </div>

      <div className="curator-note"><span>CURATOR NOTE</span><p>{product.curatorNote}</p></div>
      <div className="detail-accordions">
        <details><summary>배송 안내</summary><p>평일 오후 2시 이전 주문은 다음 영업일부터 순차 발송됩니다.</p></details>
        <details><summary>교환과 반품</summary><p>수령 후 7일 안에 사용하지 않은 상품을 접수할 수 있습니다.</p></details>
      </div>
    </div>
  );
}
