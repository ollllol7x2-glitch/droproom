"use client";

import { LockKey } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";
import { KakaoAddressFields } from "@/components/commerce/KakaoAddressFields";
import { useStore } from "@/components/commerce/StoreProvider";
import { getProductsByIds } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";

export function CheckoutClient() {
  const router = useRouter();
  const { cart, clearCart } = useStore();
  const { user } = useSupabaseUser();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const addressDetailRef = useRef<HTMLInputElement>(null);
  const productMap = new Map(
    getProductsByIds(cart.map((line) => line.productId)).map((product) => [product.id, product]),
  );
  const lines = cart.flatMap((line) => {
    const product = productMap.get(line.productId);
    return product ? [{ ...line, product }] : [];
  });
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.product.salePrice ?? line.product.price) * line.quantity,
    0,
  );
  const shipping = subtotal >= 50000 ? 0 : 3000;

  useEffect(() => {
    if (!user) return;

    const profile = user.user_metadata.droproom_profile;
    if (profile && typeof profile === "object" && !Array.isArray(profile)) {
      setCustomerName(typeof profile.name === "string" ? profile.name : "");
      setCustomerPhone(typeof profile.phone === "string" ? profile.phone : "");
    } else {
      setCustomerName(String(user.user_metadata.full_name || user.user_metadata.name || ""));
    }
    setCustomerEmail(user.email || "");

    const savedAddresses = user.user_metadata.droproom_addresses;
    if (!Array.isArray(savedAddresses)) return;
    const savedAddress = savedAddresses.find((item) => item?.isDefault === true) ?? savedAddresses[0];
    if (!savedAddress || typeof savedAddress !== "object") return;

    setPostcode(typeof savedAddress.postcode === "string" ? savedAddress.postcode : "");
    setAddress(typeof savedAddress.address === "string" ? savedAddress.address : "");
    setAddressDetail(typeof savedAddress.detail === "string" ? savedAddress.detail : "");
  }, [user]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearCart();
    router.push("/checkout/complete");
  };

  if (lines.length === 0) {
    return (
      <div className="shell utility-page">
        <header><p>CHECKOUT</p><h1>주문서</h1></header>
        <div className="empty-state">
          <h2>주문할 상품이 없어요</h2>
          <p>장바구니에 상품을 먼저 담아주세요.</p>
          <Link href="/shop">상품 둘러보기</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="shell checkout-page">
        <header>
          <p>CHECKOUT</p>
          <h1>주문서</h1>
          <span>데모 결제이며 실제 주문과 결제는 발생하지 않습니다.</span>
        </header>

        <form className="checkout-layout" onSubmit={submit}>
          <div className="checkout-form">
            <section>
              <h2>주문자 정보</h2>
              <div className="form-grid">
                <label><span>이름</span><input name="name" required autoComplete="name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} /></label>
                <label><span>휴대폰 번호</span><input name="tel" required autoComplete="tel" inputMode="tel" placeholder="010-0000-0000" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} /></label>
                <label className="full"><span>이메일</span><input name="email" type="email" required autoComplete="email" placeholder="email@example.com" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} /></label>
              </div>
            </section>

            <section>
              <h2>배송지</h2>
              <div className="form-grid">
                <KakaoAddressFields
                  idPrefix="checkout"
                  postcode={postcode}
                  address={address}
                  onPostcodeChange={setPostcode}
                  onAddressChange={setAddress}
                  detailInputRef={addressDetailRef}
                />
                <label className="full" htmlFor="address-detail">
                  <span>상세 주소</span>
                  <input
                    ref={addressDetailRef}
                    id="address-detail"
                    name="address-detail"
                    required
                    autoComplete="address-line2"
                    placeholder="동·호수 등 상세 주소"
                    value={addressDetail}
                    onChange={(event) => setAddressDetail(event.target.value)}
                  />
                </label>
                <label className="full">
                  <span>배송 메모</span>
                  <select name="memo" defaultValue="문 앞에 놓아주세요">
                    <option>문 앞에 놓아주세요</option>
                    <option>배송 전 연락해주세요</option>
                    <option>직접 입력</option>
                  </select>
                </label>
              </div>
            </section>

            <section>
              <h2>결제 수단</h2>
              <div className="payment-options">
                <label><input type="radio" name="payment" defaultChecked /><span>카드 결제</span></label>
                <label><input type="radio" name="payment" /><span>간편 결제</span></label>
                <label><input type="radio" name="payment" /><span>가상계좌</span></label>
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <h2>주문 상품</h2>
            <div className="checkout-products">
              {lines.map(({ product, quantity }) => (
                <div key={product.id}>
                  <div><Image src={assetPath(product.image)} alt="" fill sizes="70px" style={{ objectFit: "cover", objectPosition: product.imagePosition }} /></div>
                  <p><strong>{product.name}</strong><span>{quantity}개</span></p>
                  <b>{formatPrice((product.salePrice ?? product.price) * quantity)}</b>
                </div>
              ))}
            </div>
            <dl>
              <div><dt>상품 금액</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div><dt>배송비</dt><dd>{shipping === 0 ? "무료" : formatPrice(shipping)}</dd></div>
              <div className="summary-total"><dt>총 결제 금액</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
            </dl>
            <button className="add-button" type="submit"><LockKey size={18} /> 데모 결제</button>
            <p>버튼을 누르면 주문 완료 화면으로 이동하며 정보는 저장되지 않습니다.</p>
          </aside>
        </form>
      </div>
    </>
  );
}
