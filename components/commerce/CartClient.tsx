"use client";

import { Bag, Minus, Plus, Trash } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/components/commerce/StoreProvider";
import { getProductsByIds } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";

export function CartClient() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const productMap = new Map(getProductsByIds(cart.map((line) => line.productId)).map((product) => [product.id, product]));
  const lines = cart.flatMap((line) => { const product = productMap.get(line.productId); return product ? [{ ...line, product }] : []; });
  const subtotal = lines.reduce((sum, line) => sum + (line.product.salePrice ?? line.product.price) * line.quantity, 0);
  const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;

  if (lines.length === 0) return <div className="shell utility-page"><header><p>SHOPPING BAG</p><h1>장바구니</h1></header><div className="empty-state"><Bag size={36} /><h2>장바구니가 비어 있어요</h2><p>새로 도착한 물건부터 천천히 둘러보세요.</p><Link href="/shop">상품 둘러보기</Link></div></div>;

  return (
    <div className="shell cart-page">
      <header><p>SHOPPING BAG</p><h1>장바구니</h1><span>{lines.length}종의 상품</span></header>
      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map(({ product, quantity }) => (
            <article className="cart-line" key={product.id}>
              <Link className="cart-thumb" href={`/product/${product.slug}`}><Image src={assetPath(product.image)} alt="" fill sizes="160px" style={{ objectFit: "cover", objectPosition: product.imagePosition }} /></Link>
              <div className="cart-line-info"><span>{product.brand}</span><Link href={`/product/${product.slug}`}><h2>{product.name}</h2></Link><strong>{formatPrice(product.salePrice ?? product.price)}</strong></div>
              <div className="cart-quantity"><button type="button" aria-label="수량 줄이기" onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={14} /></button><output>{quantity}</output><button type="button" aria-label="수량 늘리기" onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={14} /></button></div>
              <strong className="cart-line-total">{formatPrice((product.salePrice ?? product.price) * quantity)}</strong>
              <button className="cart-remove" type="button" aria-label={`${product.name} 삭제`} onClick={() => removeFromCart(product.id)}><Trash size={18} /></button>
            </article>
          ))}
        </div>
        <aside className="order-summary"><h2>주문 금액</h2><dl><div><dt>상품 금액</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>배송비</dt><dd>{shipping === 0 ? "무료" : formatPrice(shipping)}</dd></div><div className="summary-total"><dt>결제 예정 금액</dt><dd>{formatPrice(subtotal + shipping)}</dd></div></dl><Link className="add-button" href="/checkout">주문하기</Link><p>5만 원 이상 구매 시 배송비가 무료입니다.</p></aside>
      </div>
    </div>
  );
}
