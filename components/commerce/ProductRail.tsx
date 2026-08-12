"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

const RAIL_ID = "new-product-rail";

export function ProductRail({ items }: { items: Product[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateControls = () => {
      const remaining = rail.scrollWidth - rail.clientWidth - rail.scrollLeft;
      setCanScrollLeft(rail.scrollLeft > 2);
      setCanScrollRight(remaining > 2);
    };

    const handleWheel = (event: WheelEvent) => {
      if (window.innerWidth < 768 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const movingLeft = event.deltaY < 0;
      const canMove = movingLeft ? rail.scrollLeft > 2 : rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2;
      if (!canMove) return;

      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };

    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(rail);
    rail.addEventListener("scroll", updateControls, { passive: true });
    rail.addEventListener("wheel", handleWheel, { passive: false });
    updateControls();

    return () => {
      resizeObserver.disconnect();
      rail.removeEventListener("scroll", updateControls);
      rail.removeEventListener("wheel", handleWheel);
    };
  }, [items.length]);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({
      left: direction * Math.max(320, rail.clientWidth * 0.72),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="shell product-rail">
      <button
        className="product-rail-nav product-rail-nav-prev"
        type="button"
        aria-label="이전 상품 보기"
        aria-controls={RAIL_ID}
        disabled={!canScrollLeft}
        onClick={() => scroll(-1)}
      >
        <CaretLeft size={24} weight="bold" />
      </button>

      <div className="product-grid" id={RAIL_ID} ref={railRef}>
        {items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      <button
        className="product-rail-nav product-rail-nav-next"
        type="button"
        aria-label="다음 상품 보기"
        aria-controls={RAIL_ID}
        disabled={!canScrollRight}
        onClick={() => scroll(1)}
      >
        <CaretRight size={24} weight="bold" />
      </button>
    </div>
  );
}
