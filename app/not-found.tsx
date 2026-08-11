import Link from "next/link";
export default function NotFound() { return <div className="shell complete-page"><p>404</p><h1>찾는 페이지가 없어요.</h1><span>주소가 바뀌었거나 판매가 끝난 상품일 수 있습니다.</span><Link className="primary-button" href="/shop">상품 둘러보기</Link></div>; }
