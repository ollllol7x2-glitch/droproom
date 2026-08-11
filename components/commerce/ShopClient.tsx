"use client";

import { MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { brandDirectory, categories, products, type CategoryKey } from "@/data/products";

type Props = {
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
  initialMax?: number;
};

export function ShopClient({ initialCategory, initialQuery = "", initialSort = "new", initialMax }: Props) {
  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [brand, setBrand] = useState<string>("all");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesBrand = brand === "all" || product.brand === brand;
      const matchesQuery = !normalized || `${product.name} ${product.brand} ${product.shortDescription}`.toLowerCase().includes(normalized);
      const matchesBudget = !initialMax || (product.salePrice ?? product.price) <= initialMax;
      return matchesCategory && matchesBrand && matchesQuery && matchesBudget;
    });

    return result.sort((a, b) => {
      if (sort === "low") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      if (sort === "high") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      if (sort === "best") return Number(b.badges.includes("BEST")) - Number(a.badges.includes("BEST"));
      if (sort === "drop") return Number(b.badges.includes("DROP")) - Number(a.badges.includes("DROP"));
      return Number(b.badges.includes("NEW")) - Number(a.badges.includes("NEW"));
    });
  }, [brand, category, query, sort, initialMax]);

  const activeLabel = category === "all" ? "ALL THINGS" : categories.find((item) => item.key === category)?.label;

  return (
    <div className="shop-page shell">
      <header className="shop-heading">
        <p>CURATED GOODS</p>
        <h1>{activeLabel}</h1>
        <span>서로 다른 취향을 가진 12개 브랜드의 문구, 패션, 디지털과 리빙 제품을 한곳에서 고릅니다.</span>
      </header>

      <section className="brand-directory" aria-labelledby="brand-directory-title">
        <div className="brand-directory-head">
          <h2 id="brand-directory-title">브랜드로 골라보기</h2>
          <p>발랄한 컬러부터 조용한 생활 도구까지, 브랜드마다 다른 기준을 살펴보세요.</p>
        </div>
        <div className="brand-directory-list" role="group" aria-label="입점 브랜드 선택">
          <button className={brand === "all" ? "active" : ""} type="button" onClick={() => setBrand("all")}>
            <strong>ALL BRANDS</strong><span>12개 입점 브랜드 전체</span>
          </button>
          {brandDirectory.map((item) => (
            <button key={item.name} className={brand === item.name ? "active" : ""} type="button" onClick={() => setBrand(item.name)}>
              <strong>{item.name}</strong><span>{item.note}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="category-tabs" role="group" aria-label="카테고리 선택">
        <button className={category === "all" ? "active" : ""} type="button" onClick={() => setCategory("all")}>ALL</button>
        {categories.map((item) => (
          <button key={item.key} className={category === item.key ? "active" : ""} type="button" onClick={() => setCategory(item.key as CategoryKey)}>{item.label}</button>
        ))}
      </div>

      <div className="shop-toolbar">
        <label className="inline-search">
          <span>상품 검색</span>
          <div><MagnifyingGlass size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상품명 또는 브랜드" /></div>
        </label>
        <label className="sort-field">
          <span><SlidersHorizontal size={17} /> 정렬</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="new">신상품순</option>
            <option value="best">인기순</option>
            <option value="low">낮은 가격순</option>
            <option value="high">높은 가격순</option>
          </select>
        </label>
      </div>

      <div className="shop-result-head">
        <span>{filtered.length}개의 상품</span>
        {brand !== "all" && <button type="button" onClick={() => setBrand("all")}>{brand} 선택 해제</button>}
      </div>
      {filtered.length > 0 ? (
        <ProductGrid items={filtered} />
      ) : (
        <div className="empty-state">
          <MagnifyingGlass size={34} />
          <h2>찾는 상품이 아직 없어요</h2>
          <p>검색어를 줄이거나 다른 카테고리를 확인해 주세요.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("all"); setBrand("all"); }}>전체 상품 보기</button>
        </div>
      )}
    </div>
  );
}
