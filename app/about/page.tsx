import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Clock, MapPin, Package, Phone, Sparkle, Subway } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { KakaoStoreMap } from "@/components/about/KakaoStoreMap";
import { brandDirectory } from "@/data/products";
import { assetPath } from "@/lib/assets";

export const metadata: Metadata = {
  title: "쇼핑몰 소개",
  description: "작은 디자인 물건을 매주 새롭게 소개하는 DROP ROOM의 큐레이션 원칙과 이야기를 확인해 보세요.",
};

const principles = [
  { title: "이유가 있는 선택", description: "유명해서가 아니라 쓰임과 형태가 분명한 물건을 고릅니다." },
  { title: "작게 시작하는 변화", description: "펜 한 자루와 키링 하나처럼 일상을 바로 바꾸는 물건부터 소개합니다." },
  { title: "함께 쓸 때 더 좋은 조합", description: "카테고리를 나누기보다 같은 장면에 자연스럽게 놓이는 조합을 제안합니다." },
] as const;

const dropSteps = [
  ["FIND", "서로 다른 브랜드의 새 물건을 발견합니다."],
  ["EDIT", "가격, 쓰임, 재질, 조합을 기준으로 다시 고릅니다."],
  ["DROP", "매주 하나의 선명한 장면으로 소개합니다."],
] as const;

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="shell about-hero-grid">
          <div className="about-hero-copy">
            <p>CURATED DESIGN LIFESTYLE SHOP</p>
            <h1>매일의 취향을<br />가볍게 떨어뜨립니다.</h1>
            <span>문구에서 방 꾸미기까지, 오래 곁에 둘 작은 디자인 물건을 발견하고 매주 새롭게 소개합니다.</span>
            <div className="about-hero-actions">
              <Link href="/shop?sort=new">새로 들어온 물건 <ArrowRight size={18} /></Link>
              <Link href="#our-edit">우리가 고르는 법 <ArrowDownRight size={18} /></Link>
            </div>
          </div>
          <div className="about-hero-visual">
            <div className="about-hero-symbol"><BrandLogo variant="symbol" /></div>
            <div className="about-hero-image">
              <Image src={assetPath("/images/products-v3/five-minute-desk-timer.webp")} alt="라임색 파이브 미닛 데스크 타이머" fill preload sizes="(max-width: 767px) 84vw, 44vw" style={{ objectFit: "cover" }} />
            </div>
            <p>EVERYDAY,<br />DROPPED.</p>
          </div>
        </div>
      </section>

      <section className="about-manifesto" id="our-edit">
        <div className="shell about-manifesto-grid">
          <div className="about-manifesto-mark" aria-hidden="true"><Sparkle size={32} weight="fill" /></div>
          <div className="about-manifesto-copy">
            <h2>설명보다 먼저,<strong>손이 가는 물건.</strong></h2>
            <p>책상과 가방, 방의 표정을 바꾸는 작은 물건을 고릅니다.</p>
          </div>
          <div className="about-manifesto-question">
            <span>DROP ROOM의 약속</span>
            <strong>처음엔 눈에 들어오고,<br />쓸수록 더 좋아지는 물건</strong>
            <p>잠깐 예쁜 물건보다 매일의 장면에 자연스럽게 남는 물건을 소개합니다.</p>
          </div>
        </div>
      </section>

      <section className="about-principles">
        <div className="shell">
          <div className="about-section-heading">
            <h2>우리가 고르는 세 가지 기준</h2>
            <p>각기 다른 브랜드가 입점해도 DROP ROOM의 선택에는 같은 기준이 있습니다.</p>
          </div>
          <div className="about-principle-list">
            {principles.map((principle, index) => (
              <article key={principle.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Check size={28} weight="bold" />
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-drop-process">
        <div className="shell about-drop-grid">
          <div className="about-drop-image">
            <Image src={assetPath("/images/products-v4/cobalt-notebook-orange.jpg")} alt="코발트 노트와 오렌지 컬러 소품" fill sizes="(max-width: 900px) 100vw, 48vw" style={{ objectFit: "cover" }} />
          </div>
          <div className="about-drop-copy">
            <Package size={36} weight="regular" />
            <h2>매주, 하나의 장면을 완성합니다.</h2>
            <p>Weekly Drop은 단순한 신상품 목록이 아닙니다. 공부하는 책상, 가볍게 나가는 주말, 친구에게 건네는 선물처럼 물건이 쓰일 장면을 먼저 정합니다.</p>
            <ol>
              {dropSteps.map(([label, description]) => (
                <li key={label}><strong>{label}</strong><span>{description}</span></li>
              ))}
            </ol>
            <Link href="/#weekly-drop">이번 주 DROP 보기 <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="about-brands">
        <div className="shell about-brands-layout">
          <div className="about-section-heading">
            <h2>취향은 하나로 정해지지 않으니까</h2>
            <p>서로 다른 브랜드를 둘러보며 지금 마음에 드는 물건을 발견해 보세요.</p>
          </div>
          <div className="about-brand-directory" aria-label="입점 브랜드">
            {brandDirectory.map((brand) => <span key={brand.name}>{brand.name}</span>)}
          </div>
        </div>
      </section>

      <section className="about-store" id="store-location">
        <div className="shell about-store-inner">
          <div className="about-store-info">
            <div className="about-store-heading">
              <h2>대학로에서<br />직접 만나요.</h2>
              <p>온라인에서 고른 취향을 오프라인에서 천천히 살펴보세요.</p>
            </div>

            <div className="about-store-details">
              <div>
                <MapPin size={25} weight="duotone" aria-hidden="true" />
                <span>주소</span>
                <strong>서울특별시 종로구 대학로11길 23<br />스타시티빌딩 2-4층</strong>
                <small>지번: 명륜4가 113-1</small>
              </div>
              <div>
                <Phone size={25} weight="duotone" aria-hidden="true" />
                <span>전화번호</span>
                <a href="tel:02-765-1326">02-765-1326</a>
              </div>
              <div>
                <Clock size={25} weight="duotone" aria-hidden="true" />
                <span>영업시간</span>
                <strong className="about-store-open">영업 중 · 오후 6:00에 영업 종료</strong>
              </div>
              <div>
                <Subway size={25} weight="duotone" aria-hidden="true" />
                <span>찾아오는 길</span>
                <strong>4호선 혜화역 1번 출구에서 도보 약 5분</strong>
              </div>
            </div>

            <div className="about-store-actions">
              <a href="https://map.kakao.com/link/map/DROP%20ROOM,37.5821092,127.0003792" target="_blank" rel="noreferrer">
                카카오맵에서 보기 <ArrowUpRight size={19} weight="bold" />
              </a>
              <a href="https://map.kakao.com/link/to/DROP%20ROOM,37.5821092,127.0003792" target="_blank" rel="noreferrer">
                길찾기 <ArrowRight size={19} weight="bold" />
              </a>
            </div>
          </div>

          <KakaoStoreMap />
        </div>
      </section>

      <section className="about-final">
        <div className="shell about-final-inner">
          <p>오늘의 취향은<br />어떤 물건인가요?</p>
          <Link href="/shop">모든 물건 둘러보기 <ArrowRight size={20} /></Link>
        </div>
      </section>
    </div>
  );
}
