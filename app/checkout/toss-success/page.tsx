import type { Metadata } from "next";
import { TossPaymentSuccess } from "@/components/commerce/TossPaymentResult";

export const metadata: Metadata = { title: "토스페이먼츠 테스트 결제 인증" };

export default function TossPaymentSuccessPage() {
  return <TossPaymentSuccess />;
}
