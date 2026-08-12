"use client";

import {
  ArrowLeft,
  CheckCircle,
  ShieldWarning,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  readPendingTossPayment,
  TOSS_PENDING_PAYMENT_KEY,
} from "@/lib/tossPayments";

type TossSuccessState = {
  amount: number;
  orderId: string;
  paymentKey: string;
  matchesPendingOrder: boolean;
};

type TossFailureState = {
  code: string;
  message: string;
  orderId: string;
};

export function TossPaymentSuccess() {
  const [result, setResult] = useState<TossSuccessState | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = Number(params.get("amount"));
    const orderId = params.get("orderId") || "";
    const paymentKey = params.get("paymentKey") || "";
    const pending = readPendingTossPayment(sessionStorage.getItem(TOSS_PENDING_PAYMENT_KEY));

    setResult({
      amount,
      orderId,
      paymentKey,
      matchesPendingOrder: Boolean(
        pending && pending.orderId === orderId && pending.amount === amount,
      ),
    });
  }, []);

  const hasResult = Boolean(result?.orderId && result.paymentKey && Number.isFinite(result.amount));

  return (
    <div className="shell complete-page toss-result-page">
      <CheckCircle size={58} weight="fill" />
      <p>TOSS PAYMENTS TEST</p>
      <h1>{hasResult ? "결제 인증을 확인했습니다." : "결제 정보를 확인할 수 없어요."}</h1>
      <span>
        {hasResult
          ? "토스페이먼츠 테스트 결제창의 인증 단계가 끝났습니다. 실제 금액은 청구되지 않습니다."
          : "성공 리다이렉트에 필요한 결제 정보가 없습니다. 주문서에서 다시 시도해 주세요."}
      </span>

      {hasResult && result && (
        <section className="toss-result-card">
          <div className="toss-result-notice">
            <ShieldWarning size={24} />
            <div>
              <strong>최종 승인 전입니다</strong>
              <p>GitHub Pages에는 시크릿 키를 둘 수 없어 승인 API는 호출하지 않았습니다. 장바구니도 유지됩니다.</p>
            </div>
          </div>
          <dl>
            <div><dt>결제 금액</dt><dd>{formatPrice(result.amount)}</dd></div>
            <div><dt>주문번호</dt><dd>{result.orderId}</dd></div>
            <div><dt>요청 정보 검증</dt><dd>{result.matchesPendingOrder ? "일치" : "확인 필요"}</dd></div>
            <div><dt>Payment Key</dt><dd>{result.paymentKey}</dd></div>
          </dl>
        </section>
      )}

      <div className="toss-result-actions">
        <Link className="primary-button" href="/checkout"><ArrowLeft size={18} /> 주문서로 돌아가기</Link>
        <Link className="secondary-button" href="/">홈으로</Link>
      </div>
    </div>
  );
}

export function TossPaymentFailure() {
  const [result, setResult] = useState<TossFailureState | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setResult({
      code: params.get("code") || "UNKNOWN_PAYMENT_ERROR",
      message: params.get("message") || "결제 요청을 완료하지 못했습니다.",
      orderId: params.get("orderId") || "",
    });
  }, []);

  const canceled = result?.code === "PAY_PROCESS_CANCELED";

  return (
    <div className="shell complete-page toss-result-page toss-result-page--failure">
      {canceled ? <ArrowLeft size={58} /> : <WarningCircle size={58} weight="fill" />}
      <p>TOSS PAYMENTS TEST</p>
      <h1>{canceled ? "테스트 결제를 취소했습니다." : "테스트 결제를 진행하지 못했습니다."}</h1>
      <span>{canceled ? "결제는 요청되지 않았고 장바구니도 그대로 유지됩니다." : result?.message}</span>

      {result && !canceled && (
        <section className="toss-result-card">
          <dl>
            <div><dt>오류 코드</dt><dd>{result.code}</dd></div>
            {result.orderId && <div><dt>주문번호</dt><dd>{result.orderId}</dd></div>}
          </dl>
        </section>
      )}

      <div className="toss-result-actions">
        <Link className="primary-button" href="/checkout"><ArrowLeft size={18} /> 다시 결제하기</Link>
        <Link className="secondary-button" href="/shop">상품 둘러보기</Link>
      </div>
    </div>
  );
}
