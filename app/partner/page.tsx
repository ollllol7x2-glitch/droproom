import { ArrowRight, Check, Clock, Package, Storefront } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { PartnerInquiryForm } from "@/components/legal/PartnerInquiryForm";

export const metadata: Metadata = {
  title: "입점 문의",
  description: "DROP ROOM 편집숍 입점 기준과 절차를 확인하고 데모 문의를 접수합니다.",
};

const fitList = [
  "고유한 쓰임이나 형태가 분명한 상품",
  "정상 판매 가능한 재고와 공급 체계를 갖춘 브랜드",
  "상품 정보, 이미지와 고객 응대 기준을 제공할 수 있는 브랜드",
  "문구, 디지털, 룸, 패션, 리빙, 취미 카테고리 상품",
] as const;

const process = [
  { icon: Storefront, title: "브랜드 접수", description: "브랜드와 대표 상품을 간단히 소개합니다." },
  { icon: Package, title: "상품 검토", description: "쓰임, 디자인, 가격대와 공급 조건을 확인합니다." },
  { icon: Clock, title: "입점 협의", description: "선정된 브랜드와 판매 일정 및 운영 방식을 조율합니다." },
] as const;

export default function PartnerPage() {
  return (
    <div className="partner-page">
      <section className="shell partner-hero">
        <p>PARTNER WITH DROP ROOM</p>
        <h1>좋은 물건이<br />더 자주 발견되도록</h1>
        <span>작지만 분명한 취향을 가진 브랜드를 기다립니다. 대표 상품과 브랜드 이야기를 먼저 들려주세요.</span>
        <a href="#partner-form">입점 문의 시작 <ArrowRight size={20} weight="bold" /></a>
      </section>

      <section className="partner-guide">
        <div className="shell partner-guide-grid">
          <div className="partner-fit">
            <h2>이런 브랜드와 잘 맞아요</h2>
            <ul>
              {fitList.map((item) => <li key={item}><Check size={22} weight="bold" />{item}</li>)}
            </ul>
            <p>대량 생산 브랜드와 신생 브랜드를 구분하지 않습니다. 상품의 이유와 실제 운영 가능성을 함께 봅니다.</p>
          </div>

          <div className="partner-process">
            <h2>입점은 이렇게 진행됩니다</h2>
            <ol>
              {process.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <Icon size={28} weight="regular" aria-hidden="true" />
                  <div><strong>{title}</strong><span>{description}</span></div>
                </li>
              ))}
            </ol>
            <div className="partner-sample-contact">
              <span>샘플 상담 이메일</span>
              <strong>partner@droproom.example</strong>
              <small>실제 수신되지 않는 화면 구성용 주소입니다.</small>
            </div>
          </div>
        </div>
      </section>

      <section id="partner-form" className="shell partner-form-section">
        <PartnerInquiryForm />
      </section>
    </div>
  );
}

