"use client";

import { LockKey } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { useStore } from "@/components/commerce/StoreProvider";
import { getProductsByIds } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";

export function CheckoutClient() {
  const router = useRouter();
  const { cart, clearCart } = useStore();
  const productMap = new Map(getProductsByIds(cart.map((line) => line.productId)).map((product) => [product.id, product]));
  const lines = cart.flatMap((line) => { const product = productMap.get(line.productId); return product ? [{ ...line, product }] : []; });
  const subtotal = lines.reduce((sum, line) => sum + (line.product.salePrice ?? line.product.price) * line.quantity, 0);
  const shipping = subtotal >= 50000 ? 0 : 3000;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearCart();
    router.push("/checkout/complete");
  };

  if (lines.length === 0) return <div className="shell utility-page"><header><p>CHECKOUT</p><h1>주문서</h1></header><div className="empty-state"><h2>주문할 상품이 없어요</h2><p>장바구니에 상품을 먼저 담아주세요.</p><Link href="/shop">상품 둘러보기</Link></div></div>;

  return (
    <div className="shell checkout-page">
      <header><p>CHECKOUT</p><h1>주문서</h1><span>데모 결제이며 실제 주문과 결제는 발생하지 않습니다.</span></header>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-form">
          <section><h2>주문자 정보</h2><div className="form-grid"><label><span>이름</span><input name="name" required autoComplete="name" /></label><label><span>휴대폰 번호</span><input name="tel" required autoComplete="tel" inputMode="tel" placeholder="010-0000-0000" /></label><label className="full"><span>이메일</span><input name="email" type="email" required autoComplete="email" placeholder="email@example.com" /></label></div></section>
          <section><h2>배송지</h2><div className="form-grid"><label className="full"><span>주소</span><input name="address" required autoComplete="street-address" /></label><label className="full"><span>상세 주소</span><input name="address-detail" required /></label><label className="full"><span>배송 메모</span><select name="memo" defaultValue="문 앞에 놓아주세요"><option>문 앞에 놓아주세요</option><option>배송 전 연락해주세요</option><option>직접 입력</option></select></label></div></section>
          <section><h2>결제 수단</h2><div className="payment-options"><label><input type="radio" name="payment" defaultChecked /><span>카드 결제</span></label><label><input type="radio" name="payment" /><span>간편 결제</span></label><label><input type="radio" name="payment" /><span>가상계좌</span></label></div></section>
        </div>
        <aside className="checkout-summary"><h2>주문 상품</h2><div className="checkout-products">{lines.map(({ product, quantity }) => <div key={product.id}><div><Image src={assetPath(product.image)} alt="" fill sizes="70px" style={{ objectFit: "cover", objectPosition: product.imagePosition }} /></div><p><strong>{product.name}</strong><span>{quantity}개</span></p><b>{formatPrice((product.salePrice ?? product.price) * quantity)}</b></div>)}</div><dl><div><dt>상품 금액</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>배송비</dt><dd>{shipping === 0 ? "무료" : formatPrice(shipping)}</dd></div><div className="summary-total"><dt>총 결제 금액</dt><dd>{formatPrice(subtotal + shipping)}</dd></div></dl><button className="add-button" type="submit"><LockKey size={18} /> 데모 결제</button><p>버튼을 누르면 주문 완료 화면으로 이동하며 정보는 저장되지 않습니다.</p></aside>
      </form>
    </div>
  );
}
