import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell service-grid">
        <div><strong>빠른 배송</strong><span>평일 오후 2시 이전 주문</span></div>
        <div><strong>선물 포장</strong><span>작은 물건도 정성스럽게</span></div>
        <div><strong>쉬운 교환</strong><span>수령 후 7일 이내 접수</span></div>
        <div><strong>고객센터</strong><span>평일 10:00-17:00</span></div>
      </div>
      <div className="shell footer-main">
        <div>
          <p className="footer-brand-name">DROP ROOM</p>
          <p className="footer-copy">문구부터 방 꾸미기까지, 오래 곁에 둘 물건을 고릅니다.</p>
        </div>
        <form className="newsletter">
          <label htmlFor="newsletter-email">매주 새 DROP 받기</label>
          <div>
            <input id="newsletter-email" type="email" placeholder="email@example.com" aria-describedby="newsletter-help" />
            <button type="button">구독</button>
          </div>
          <span id="newsletter-help">데모 화면이며 이메일은 저장되지 않습니다.</span>
        </form>
      </div>
      <div className="shell footer-bottom">
        <div>
          <Link href="/">이용약관</Link>
          <Link href="/">개인정보처리방침</Link>
          <Link href="/">입점 문의</Link>
          <Link href="/admin">관리자센터</Link>
        </div>
        <span>© DROP ROOM. Demo store.</span>
      </div>
    </footer>
  );
}
