"use client";

import {
  CheckCircle,
  HouseLine,
  LockKey,
  MapPinLine,
  PencilSimple,
  Plus,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";
import { KakaoAddressFields } from "@/components/commerce/KakaoAddressFields";
import { useStore } from "@/components/commerce/StoreProvider";
import { TossPaymentWidget } from "@/components/commerce/TossPaymentWidget";
import { getProductsByIds } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";
import {
  createTossOrderId,
  getTossRedirectUrl,
  TOSS_PENDING_PAYMENT_KEY,
  type PendingTossPayment,
} from "@/lib/tossPayments";

type DeliveryMode = "saved" | "new";

type CheckoutAddress = {
  label: string;
  recipient: string;
  phone: string;
  postcode: string;
  address: string;
  detail: string;
};

function readCheckoutAddress(value: unknown): CheckoutAddress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (typeof item.address !== "string" || !item.address) return null;

  return {
    label: typeof item.label === "string" && item.label ? item.label : "기본 배송지",
    recipient: typeof item.recipient === "string" ? item.recipient : "",
    phone: typeof item.phone === "string" ? item.phone : "",
    postcode: typeof item.postcode === "string" ? item.postcode : "",
    address: item.address,
    detail: typeof item.detail === "string" ? item.detail : "",
  };
}

export function CheckoutClient() {
  const { cart } = useStore();
  const { user } = useSupabaseUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tossWidgets, setTossWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("new");
  const [savedDefaultAddress, setSavedDefaultAddress] = useState<CheckoutAddress | null>(null);
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
    if (!user) {
      setSavedDefaultAddress(null);
      setDeliveryMode("new");
      return;
    }

    const profile = user.user_metadata.droproom_profile;
    if (profile && typeof profile === "object" && !Array.isArray(profile)) {
      setCustomerName(typeof profile.name === "string" ? profile.name : "");
      setCustomerPhone(typeof profile.phone === "string" ? profile.phone : "");
    } else {
      setCustomerName(String(user.user_metadata.full_name || user.user_metadata.name || ""));
    }
    setCustomerEmail(user.email || "");

    const savedAddresses = user.user_metadata.droproom_addresses;
    if (!Array.isArray(savedAddresses)) {
      setSavedDefaultAddress(null);
      setDeliveryMode("new");
      return;
    }
    const savedAddress = savedAddresses.find((item) => item?.isDefault === true) ?? savedAddresses[0];
    const parsedAddress = readCheckoutAddress(savedAddress);
    setSavedDefaultAddress(parsedAddress);
    setDeliveryMode(parsedAddress ? "saved" : "new");
  }, [user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!tossWidgets) {
      setPaymentError("결제 UI가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setPaymentError("");

    const orderId = createTossOrderId();
    const orderName = lines.length > 1
      ? `${lines[0].product.name} 외 ${lines.length - 1}건`
      : lines[0].quantity > 1
        ? `${lines[0].product.name} ${lines[0].quantity}개`
        : lines[0].product.name;
    const pendingPayment: PendingTossPayment = {
      orderId,
      orderName,
      amount: subtotal + shipping,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem(TOSS_PENDING_PAYMENT_KEY, JSON.stringify(pendingPayment));

    try {
      await tossWidgets.requestPayment({
        orderId,
        orderName,
        successUrl: getTossRedirectUrl("/checkout/toss-success/"),
        failUrl: getTossRedirectUrl("/checkout/toss-fail/"),
        customerEmail: customerEmail || undefined,
        customerName: customerName || undefined,
        customerMobilePhone: customerPhone.replace(/\D/g, "") || undefined,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "결제창을 열지 못했습니다. 잠시 후 다시 시도해 주세요.";
      setPaymentError(message);
      setIsSubmitting(false);
    }
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
              <fieldset className="delivery-choice">
                <legend>배송지 선택</legend>
                <div>
                  <label className={deliveryMode === "saved" ? "active" : ""}>
                    <input
                      type="radio"
                      name="delivery-mode"
                      value="saved"
                      checked={deliveryMode === "saved"}
                      disabled={!savedDefaultAddress}
                      onChange={() => setDeliveryMode("saved")}
                    />
                    <span className="delivery-choice-icon"><HouseLine size={22} /></span>
                    <span className="delivery-choice-copy">
                      <strong>기본 배송지</strong>
                      <small>{savedDefaultAddress ? savedDefaultAddress.label : "저장된 기본 배송지가 없어요"}</small>
                    </span>
                    {deliveryMode === "saved" && <CheckCircle className="delivery-choice-check" size={22} weight="fill" />}
                  </label>

                  <label className={deliveryMode === "new" ? "active" : ""}>
                    <input
                      type="radio"
                      name="delivery-mode"
                      value="new"
                      checked={deliveryMode === "new"}
                      onChange={() => setDeliveryMode("new")}
                    />
                    <span className="delivery-choice-icon"><Plus size={22} /></span>
                    <span className="delivery-choice-copy">
                      <strong>새 배송지</strong>
                      <small>이번 주문에 사용할 주소를 입력해요</small>
                    </span>
                    {deliveryMode === "new" && <CheckCircle className="delivery-choice-check" size={22} weight="fill" />}
                  </label>
                </div>
              </fieldset>

              {deliveryMode === "saved" && savedDefaultAddress ? (
                <div className="checkout-saved-address">
                  <div className="checkout-saved-address-head">
                    <span><MapPinLine size={21} /></span>
                    <div>
                      <strong>{savedDefaultAddress.label}</strong>
                      <small>기본 배송지</small>
                    </div>
                    <Link href="/account"><PencilSimple size={18} /> 배송지 관리</Link>
                  </div>
                  <p>
                    <strong>{savedDefaultAddress.recipient}</strong>
                    <span>{savedDefaultAddress.phone}</span>
                  </p>
                  <address>
                    <span>{savedDefaultAddress.postcode}</span>
                    <strong>{savedDefaultAddress.address}</strong>
                    {savedDefaultAddress.detail && <small>{savedDefaultAddress.detail}</small>}
                  </address>
                  <input type="hidden" name="postcode" value={savedDefaultAddress.postcode} />
                  <input type="hidden" name="address" value={savedDefaultAddress.address} />
                  <input type="hidden" name="address-detail" value={savedDefaultAddress.detail} />
                  <input type="hidden" name="recipient" value={savedDefaultAddress.recipient} />
                  <input type="hidden" name="recipient-phone" value={savedDefaultAddress.phone} />
                </div>
              ) : (
                <div className="form-grid checkout-new-address">
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
                </div>
              )}

              <div className="form-grid delivery-memo-grid">
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
              <p className="toss-payment-intro">토스페이먼츠 SDK v2 테스트 결제입니다. 실제 금액은 청구되지 않습니다.</p>
              <TossPaymentWidget
                amount={subtotal + shipping}
                onReady={setTossWidgets}
                onError={setPaymentError}
              />
              {paymentError && <p className="toss-payment-error" role="alert">{paymentError}</p>}
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
            <button className="add-button" type="submit" disabled={!tossWidgets || isSubmitting} aria-busy={isSubmitting}>
              <LockKey size={18} /> {isSubmitting ? "결제창 여는 중" : "토스로 테스트 결제"}
            </button>
            <p>테스트 키를 사용하며 실제 결제와 배송은 진행되지 않습니다.</p>
          </aside>
        </form>
      </div>
    </>
  );
}
