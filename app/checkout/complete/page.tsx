"use client";

import { CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/components/commerce/StoreProvider";

export default function CheckoutCompletePage() {
  const { clearCart } = useStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return <div className="shell complete-page"><CheckCircle size={58} weight="fill" /><p>ORDER COMPLETE</p><h1>주문 데모가 완료됐습니다.</h1><span>실제 결제와 배송은 진행되지 않습니다. 쇼핑 흐름을 확인하기 위한 화면입니다.</span><div><Link className="primary-button" href="/">홈으로</Link><Link className="secondary-button" href="/shop">계속 둘러보기</Link></div></div>;
}
