import type { Metadata } from "next";
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "이용약관",
  description: "DROP ROOM 데모 쇼핑몰 이용약관을 확인합니다.",
};

const sections: LegalSection[] = [
  {
    id: "purpose",
    title: "목적과 적용 범위",
    paragraphs: ["이 약관은 DROP ROOM이 제공하는 온라인 편집숍 서비스의 이용 조건과 회사 및 이용자의 권리, 의무를 정하는 것을 목적으로 합니다."],
    items: ["상품 탐색, 찜, 장바구니, 주문 및 결제 기능", "회원 정보와 배송지 관리 기능", "리뷰, 문의와 같은 커뮤니티 기능"],
  },
  {
    id: "account",
    title: "회원 가입과 계정",
    paragraphs: ["이용자는 정확한 정보를 제공해야 하며 자신의 계정을 안전하게 관리할 책임이 있습니다. 타인의 정보를 도용하거나 서비스 운영을 방해하는 경우 이용이 제한될 수 있습니다."],
  },
  {
    id: "order",
    title: "상품 주문과 계약 성립",
    paragraphs: ["이용자가 주문서를 제출하고 결제가 승인되면 주문이 접수됩니다. 재고 오류, 표시 가격 오류, 배송 불가 지역 등 합리적인 사유가 있는 경우 주문을 취소하고 안내할 수 있습니다."],
    items: ["상품명, 옵션, 수량과 결제 금액을 결제 전에 확인합니다.", "미성년자는 법정대리인의 동의가 필요한 상품을 구매할 수 없습니다.", "데모 결제는 실제 주문 및 배송으로 이어지지 않습니다."],
  },
  {
    id: "delivery",
    title: "배송과 교환 및 반품",
    paragraphs: ["배송 일정은 상품과 입점 브랜드에 따라 달라질 수 있습니다. 이용자는 상품 수령 후 7일 이내 교환 또는 반품을 요청할 수 있습니다."],
    items: ["단순 변심의 경우 왕복 배송비가 발생할 수 있습니다.", "사용 흔적, 구성품 누락, 포장 훼손으로 상품 가치가 감소한 경우 반품이 제한될 수 있습니다.", "상품 불량이나 오배송은 판매자가 배송비를 부담합니다."],
  },
  {
    id: "payment",
    title: "결제와 환불",
    paragraphs: ["결제는 화면에 표시된 결제 수단을 통해 진행됩니다. 취소가 승인되면 사용한 결제 수단의 처리 일정에 따라 환불됩니다."],
  },
  {
    id: "responsibility",
    title: "서비스 이용과 책임",
    paragraphs: ["DROP ROOM은 안정적인 서비스 제공을 위해 노력합니다. 천재지변, 통신 장애, 외부 결제사 장애 등 통제하기 어려운 사유로 서비스가 중단될 수 있습니다."],
    items: ["불법 정보 게시, 자동화된 비정상 접근, 타인의 권리 침해를 금지합니다.", "상품 정보는 입점 브랜드가 제공한 내용을 바탕으로 표시될 수 있습니다.", "약관 변경 시 적용일과 변경 내용을 서비스 화면에 안내합니다."],
  },
  {
    id: "contact",
    title: "문의와 분쟁 해결",
    paragraphs: ["주문과 서비스 이용에 관한 문의는 고객센터를 통해 접수합니다. 분쟁이 발생하면 관련 법령과 상호 협의를 바탕으로 해결합니다."],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="TERMS OF USE"
      title="이용약관"
      summary="주문부터 배송, 교환과 환불까지 DROP ROOM 이용에 필요한 기본 기준을 안내합니다."
      effectiveDate="2026-08-12"
      sections={sections}
    />
  );
}

