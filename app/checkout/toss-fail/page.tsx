import type { Metadata } from "next";
import { TossPaymentFailure } from "@/components/commerce/TossPaymentResult";

export const metadata: Metadata = { title: "토스페이먼츠 테스트 결제 실패" };

export default function TossPaymentFailurePage() {
  return <TossPaymentFailure />;
}
