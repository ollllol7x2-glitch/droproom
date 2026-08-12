"use client";

import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets,
  type WidgetAgreementWidget,
  type WidgetPaymentMethodWidget,
} from "@tosspayments/tosspayments-sdk";
import { useEffect, useRef, useState } from "react";
import { TOSS_TEST_CLIENT_KEY } from "@/lib/tossPayments";

type TossPaymentWidgetProps = {
  amount: number;
  onReady: (widgets: TossPaymentsWidgets | null) => void;
  onError: (message: string) => void;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "결제 UI를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function TossPaymentWidget({ amount, onReady, onError }: TossPaymentWidgetProps) {
  const paymentMethodRef = useRef<WidgetPaymentMethodWidget | null>(null);
  const agreementRef = useRef<WidgetAgreementWidget | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function initialize() {
      setIsReady(false);
      onReady(null);
      onError("");

      try {
        const tossPayments = await loadTossPayments(TOSS_TEST_CLIENT_KEY);
        if (!active) return;

        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        await widgets.setAmount({ currency: "KRW", value: amount });

        const [paymentMethod, agreement] = await Promise.all([
          widgets.renderPaymentMethods({ selector: "#toss-payment-methods", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#toss-payment-agreement", variantKey: "AGREEMENT" }),
        ]);

        if (!active) {
          await Promise.allSettled([paymentMethod.destroy(), agreement.destroy()]);
          return;
        }

        paymentMethodRef.current = paymentMethod;
        agreementRef.current = agreement;
        onReady(widgets);
        setIsReady(true);
      } catch (error) {
        if (active) onError(getErrorMessage(error));
      }
    }

    void initialize();

    return () => {
      active = false;
      onReady(null);
      const paymentMethod = paymentMethodRef.current;
      const agreement = agreementRef.current;
      paymentMethodRef.current = null;
      agreementRef.current = null;
      if (paymentMethod) void paymentMethod.destroy();
      if (agreement) void agreement.destroy();
    };
  }, [amount, onError, onReady]);

  return (
    <div className="toss-payment-shell">
      {!isReady && <p className="toss-payment-loading">토스페이먼츠 결제 UI를 불러오는 중입니다.</p>}
      <div id="toss-payment-methods" />
      <div id="toss-payment-agreement" />
    </div>
  );
}
