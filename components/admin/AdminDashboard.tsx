"use client";

import {
  ArrowSquareOut,
  Bag,
  Bell,
  CaretDown,
  ChartLineUp,
  CheckCircle,
  Cube,
  House,
  List,
  MagnifyingGlass,
  Package,
  Plus,
  Storefront,
  Tag,
  TrendUp,
  UserCircle,
  Users,
  Warning,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { adminCustomers, adminOrders, weeklySales } from "@/data/admin";
import { products } from "@/data/products";

type AdminView = "dashboard" | "orders" | "products" | "inventory" | "customers";

const menuItems: { id: AdminView; label: string; icon: typeof House }[] = [
  { id: "dashboard", label: "대시보드", icon: House },
  { id: "orders", label: "주문 관리", icon: Bag },
  { id: "products", label: "상품 관리", icon: Tag },
  { id: "inventory", label: "재고 관리", icon: Cube },
  { id: "customers", label: "고객 관리", icon: Users },
];

const viewTitles: Record<AdminView, { title: string; description: string }> = {
  dashboard: { title: "대시보드", description: "오늘 스토어에서 일어난 변화를 확인하세요." },
  orders: { title: "주문 관리", description: "결제부터 배송까지 주문 상태를 한곳에서 관리합니다." },
  products: { title: "상품 관리", description: "판매 중인 상품과 노출 상태를 관리합니다." },
  inventory: { title: "재고 관리", description: "재고 부족 상품을 확인하고 입고를 준비합니다." },
  customers: { title: "고객 관리", description: "구매 고객과 주문 이력을 확인합니다." },
};

const formatPrice = (value: number) => `${value.toLocaleString("ko-KR")}원`;

type AdminDashboardProps = {
  currentUser: {
    name: string;
    email: string;
  };
};

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [noticeRead, setNoticeRead] = useState(false);

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) =>
      `${product.name} ${product.brand} ${product.slug}`.toLowerCase().includes(keyword),
    );
  }, [query]);

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return adminOrders;
    return adminOrders.filter((order) =>
      `${order.id} ${order.customer} ${order.product} ${order.status}`.toLowerCase().includes(keyword),
    );
  }, [query]);

  const lowStockProducts = products.filter((product) => product.stockStatus !== "in_stock");
  const current = viewTitles[activeView];
  const userInitial = currentUser.name.trim().slice(0, 1).toUpperCase() || "D";

  const selectView = (view: AdminView) => {
    setActiveView(view);
    setQuery("");
    setMenuOpen(false);
  };

  return (
    <div className="admin-page">
      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-head">
          <Link href="/" aria-label="DROP ROOM 쇼핑몰 홈">
            <BrandLogo variant="header" />
          </Link>
          <button type="button" className="admin-mobile-close" onClick={() => setMenuOpen(false)} aria-label="관리자 메뉴 닫기">
            <X size={22} />
          </button>
        </div>

        <div className="admin-store-switcher">
          <span className="admin-store-avatar">DR</span>
          <span><strong>DROP ROOM</strong><small>메인 스토어</small></span>
          <CaretDown size={16} />
        </div>

        <nav className="admin-nav" aria-label="관리자 메뉴">
          <span>스토어 관리</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                className={activeView === item.id ? "active" : ""}
                onClick={() => selectView(item.id)}
              >
                <Icon size={20} weight={activeView === item.id ? "fill" : "regular"} />
                {item.label}
                {item.id === "orders" && <b>5</b>}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">
            <Storefront size={20} /> 쇼핑몰 보기 <ArrowSquareOut size={16} />
          </Link>
          <Link href="/account"><UserCircle size={20} /> {currentUser.email || "운영자 계정"}</Link>
        </div>
      </aside>

      {menuOpen && <button className="admin-menu-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기" />}

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button className="admin-menu-trigger" type="button" onClick={() => setMenuOpen(true)} aria-label="관리자 메뉴 열기">
            <List size={23} />
          </button>
          <label className="admin-global-search">
            <MagnifyingGlass size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={activeView === "orders" ? "주문번호 또는 고객명 검색" : activeView === "products" || activeView === "inventory" ? "상품명 또는 브랜드 검색" : "관리자 메뉴 검색"}
            />
            <kbd>⌘ K</kbd>
          </label>
          <button className="admin-notice-button" type="button" onClick={() => setNoticeRead(true)} aria-label="알림 확인">
            <Bell size={21} />
            {!noticeRead && <span />}
          </button>
          <Link className="admin-profile" href="/account" aria-label="운영자 계정 보기">
            <span>{userInitial}</span><strong>{currentUser.name}</strong><CaretDown size={15} />
          </Link>
        </header>

        <main className="admin-content">
          <div className="admin-page-title">
            <div><p>ADMIN</p><h1>{current.title}</h1><span>{current.description}</span></div>
            <button type="button" className="admin-primary-action" onClick={() => selectView("products")}><Plus size={19} /> 상품 등록</button>
          </div>

          {activeView === "dashboard" && <DashboardView onNavigate={selectView} lowStockCount={lowStockProducts.length} />}
          {activeView === "orders" && <OrdersView orders={filteredOrders} />}
          {activeView === "products" && <ProductsView productsToShow={filteredProducts} />}
          {activeView === "inventory" && <InventoryView productsToShow={filteredProducts} />}
          {activeView === "customers" && <CustomersView />}
        </main>
      </div>
    </div>
  );
}

function DashboardView({ onNavigate, lowStockCount }: { onNavigate: (view: AdminView) => void; lowStockCount: number }) {
  return (
    <div className="admin-dashboard-view">
      <section className="admin-metrics" aria-label="오늘의 주요 지표">
        <MetricCard label="오늘 매출" value="1,284,600원" change="12.8%" icon={TrendUp} />
        <MetricCard label="신규 주문" value="38건" change="8.4%" icon={Bag} />
        <MetricCard label="신규 고객" value="12명" change="5.2%" icon={Users} />
        <MetricCard label="재고 알림" value={`${lowStockCount}건`} change="확인 필요" icon={Warning} alert />
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-sales-panel">
          <div className="admin-panel-head"><div><h2>판매 추이</h2><p>최근 7일 결제 완료 매출</p></div><button type="button">최근 7일 <CaretDown size={15} /></button></div>
          <div className="admin-sales-total"><strong>7,642,800원</strong><span><TrendUp size={17} /> 지난주보다 9.7%</span></div>
          <div className="admin-bar-chart" aria-label="최근 7일 판매 추이 막대 차트">
            {weeklySales.map((item) => <div key={item.day}><span style={{ height: `${item.value}%` }} /><small>{item.day}</small></div>)}
          </div>
        </section>

        <section className="admin-panel admin-tasks-panel">
          <div className="admin-panel-head"><div><h2>오늘 할 일</h2><p>처리가 필요한 운영 항목</p></div></div>
          <button type="button" onClick={() => onNavigate("orders")}><span><Package size={20} />배송 준비 주문</span><strong>5건</strong></button>
          <button type="button" onClick={() => onNavigate("orders")}><span><Warning size={20} />취소 요청</span><strong>1건</strong></button>
          <button type="button" onClick={() => onNavigate("inventory")}><span><Cube size={20} />재고 부족 상품</span><strong>{lowStockCount}건</strong></button>
          <button type="button" onClick={() => onNavigate("products")}><span><CheckCircle size={20} />정보 확인 대기</span><strong>2건</strong></button>
        </section>
      </div>

      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-head"><div><h2>최근 주문</h2><p>최신 주문과 처리 상태</p></div><button type="button" onClick={() => onNavigate("orders")}>전체 주문 보기</button></div>
        <OrderTable orders={adminOrders.slice(0, 5)} />
      </section>
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon, alert = false }: { label: string; value: string; change: string; icon: typeof TrendUp; alert?: boolean }) {
  return <article className={`admin-metric-card ${alert ? "is-alert" : ""}`}><div><span>{label}</span><strong>{value}</strong><small>{change}</small></div><i><Icon size={23} weight="duotone" /></i></article>;
}

function OrdersView({ orders }: { orders: typeof adminOrders }) {
  return <section className="admin-panel admin-table-panel"><div className="admin-panel-head"><div><h2>전체 주문</h2><p>{orders.length}건의 주문이 검색되었습니다.</p></div><button type="button">상태 필터 <CaretDown size={15} /></button></div><OrderTable orders={orders} /></section>;
}

function OrderTable({ orders }: { orders: typeof adminOrders }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>주문번호</th><th>고객</th><th>상품</th><th>결제금액</th><th>상태</th><th>주문일시</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td>{order.product}</td><td>{formatPrice(order.amount)}</td><td><span className={`admin-status status-${order.status}`}>{order.status}</span></td><td>{order.orderedAt}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function ProductsView({ productsToShow }: { productsToShow: typeof products }) {
  return (
    <section className="admin-panel admin-table-panel">
      <div className="admin-panel-head"><div><h2>판매 상품</h2><p>{productsToShow.length}개 상품</p></div><button type="button">카테고리 <CaretDown size={15} /></button></div>
      <div className="admin-table-wrap"><table className="admin-table admin-product-table"><thead><tr><th>상품</th><th>카테고리</th><th>판매가</th><th>재고 상태</th><th>노출</th></tr></thead><tbody>{productsToShow.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><span><Image src={product.image} alt="" fill sizes="54px" style={{ objectFit: "cover", objectPosition: product.imagePosition }} /></span><div><strong>{product.name}</strong><small>{product.brand}</small></div></div></td><td>{product.category.toUpperCase()}</td><td>{formatPrice(product.salePrice ?? product.price)}</td><td><StockStatus status={product.stockStatus} /></td><td><span className="admin-visibility">판매중</span></td></tr>)}</tbody></table></div>
    </section>
  );
}

function InventoryView({ productsToShow }: { productsToShow: typeof products }) {
  const inventory = productsToShow.filter((product) => product.stockStatus !== "in_stock");
  return <section className="admin-inventory-grid">{inventory.map((product, index) => <article className="admin-inventory-card" key={product.id}><div className="admin-inventory-image"><Image src={product.image} alt="" fill sizes="96px" style={{ objectFit: "cover", objectPosition: product.imagePosition }} /></div><div><StockStatus status={product.stockStatus} /><h2>{product.name}</h2><p>{product.brand}</p><strong>{product.stockStatus === "sold_out" ? "재고 0개" : `재고 ${index + 3}개`}</strong></div><button type="button">입고 수량 등록</button></article>)}</section>;
}

function StockStatus({ status }: { status: (typeof products)[number]["stockStatus"] }) {
  const labels = { in_stock: "재고 충분", low_stock: "재고 부족", sold_out: "품절" };
  return <span className={`admin-stock stock-${status}`}>{labels[status]}</span>;
}

function CustomersView() {
  return <section className="admin-panel admin-table-panel"><div className="admin-panel-head"><div><h2>고객 목록</h2><p>{adminCustomers.length}명의 최근 고객</p></div><button type="button">고객 내보내기</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>고객</th><th>이메일</th><th>주문</th><th>누적 구매액</th><th>가입일</th></tr></thead><tbody>{adminCustomers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.email}</td><td>{customer.orders}건</td><td>{formatPrice(customer.spent)}</td><td>{customer.joinedAt}</td></tr>)}</tbody></table></div></section>;
}
