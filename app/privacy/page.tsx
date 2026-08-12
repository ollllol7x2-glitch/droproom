import type { Metadata } from "next";
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "DROP ROOM 데모 쇼핑몰 개인정보처리방침을 확인합니다.",
};

const sections: LegalSection[] = [
  {
    id: "collection",
    title: "수집하는 개인정보",
    paragraphs: ["DROP ROOM은 회원 관리, 주문 처리와 고객 응대를 위해 필요한 범위에서 개인정보를 수집합니다."],
    items: ["회원 정보: 이름, 이메일, 프로필 이미지, 로그인 식별값", "주문 정보: 수령인, 연락처, 주소, 주문 및 결제 내역", "문의 정보: 작성자, 이메일, 문의 내용과 답변 기록", "자동 수집 정보: 접속 기록, 기기 및 브라우저 정보, 쿠키"],
  },
  {
    id: "purpose",
    title: "이용 목적",
    items: ["회원 식별과 계정 관리", "상품 주문, 결제, 배송과 환불 처리", "고객 문의 응대와 서비스 품질 개선", "부정 이용 방지와 시스템 보안", "동의한 이용자에 한한 상품 및 이벤트 안내"],
  },
  {
    id: "retention",
    title: "보유 및 이용 기간",
    paragraphs: ["개인정보는 수집 목적이 달성되면 지체 없이 파기합니다. 다만 전자상거래 관련 법령 등에서 일정 기간 보관을 요구하는 정보는 해당 기간 동안 안전하게 보관합니다."],
    items: ["계약 또는 청약철회 기록: 5년", "대금결제와 재화 공급 기록: 5년", "소비자 불만 또는 분쟁 처리 기록: 3년", "접속 기록: 3개월"],
  },
  {
    id: "third-party",
    title: "제3자 제공과 처리 위탁",
    paragraphs: ["배송과 결제 등 서비스 제공에 필요한 경우에만 개인정보 처리를 외부 업체에 위탁할 수 있습니다. 실제 운영 시 업체명, 위탁 업무와 보유 기간을 별도로 공개합니다."],
    items: ["샘플 결제사: 결제 승인과 취소 처리", "샘플 배송사: 상품 배송과 배송 조회", "샘플 클라우드 사업자: 데이터 보관과 시스템 운영"],
  },
  {
    id: "rights",
    title: "이용자의 권리",
    paragraphs: ["이용자는 자신의 개인정보를 조회, 수정, 삭제하거나 처리 정지를 요청할 수 있습니다. 회원 탈퇴와 배송지 관리는 마이페이지에서 요청할 수 있습니다."],
  },
  {
    id: "cookies",
    title: "쿠키와 맞춤 기능",
    paragraphs: ["장바구니 유지, 로그인 상태 확인과 이용 환경 개선을 위해 쿠키 또는 브라우저 저장소를 사용할 수 있습니다. 브라우저 설정에서 저장을 제한하거나 삭제할 수 있으나 일부 기능이 제한될 수 있습니다."],
  },
  {
    id: "security",
    title: "안전성 확보 조치",
    items: ["개인정보 접근 권한의 최소화와 정기 점검", "전송 구간 암호화와 인증 정보 보호", "보안 사고 예방을 위한 접속 기록 관리", "처리 담당자 교육과 내부 관리 계획 운영"],
  },
  {
    id: "manager",
    title: "개인정보 문의",
    paragraphs: ["개인정보 관련 문의와 권리 행사는 개인정보 보호 담당자에게 요청할 수 있습니다. 아래 연락처는 화면 확인을 위한 예시이며 실제 수신 주소가 아닙니다."],
    items: ["담당 부서: DROP ROOM 고객경험팀", "샘플 이메일: privacy@droproom.example", "운영 시간: 평일 10:00-17:00"],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="PRIVACY POLICY"
      title="개인정보처리방침"
      summary="어떤 정보를 왜 수집하고, 얼마나 보관하며, 이용자가 어떻게 관리할 수 있는지 안내합니다."
      effectiveDate="2026-08-12"
      sections={sections}
    />
  );
}

