import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "마이페이지" };

export default function AccountPage() {
  return (
    <div className="shell account-page auth-account-page">
      <div className="auth-intro">
        <p>MY DROP ROOM</p>
        <h1>취향을 모으는 가장 간단한 방법.</h1>
        <span>찜한 상품과 장바구니는 이 브라우저에 저장되어 로그인 없이도 둘러볼 수 있습니다.</span>
        <ul className="auth-benefits" aria-label="미리보기 기능">
          <li><Check size={18} weight="bold" /> 찜 목록과 장바구니 사용</li>
          <li><Check size={18} weight="bold" /> 상품 탐색과 주문 데모 확인</li>
          <li><Check size={18} weight="bold" /> 관리자 대시보드 미리보기</li>
        </ul>
      </div>

      <section className="auth-panel" aria-label="GitHub Pages 미리보기 안내">
        <span className="auth-panel-label">STATIC PREVIEW</span>
        <h2>공개 쇼핑몰 미리보기</h2>
        <p>GitHub Pages는 정적 호스팅이므로 Google 로그인은 서버 배포 환경에서 활성화됩니다.</p>
        <div className="auth-setup-notice" role="status">
          <strong>로그인 없이 이용할 수 있어요.</strong>
          <span>상품, 찜, 장바구니, 주문 데모 기능은 그대로 확인할 수 있습니다.</span>
        </div>
        <Link className="auth-primary-link" href="/shop">
          쇼핑 시작하기 <ArrowRight size={19} />
        </Link>
        <Link className="auth-browse-link" href="/admin">
          관리자 데모 보기 <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
