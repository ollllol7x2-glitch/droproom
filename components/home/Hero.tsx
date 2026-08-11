"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProductsByIds } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";

const heroProducts = getProductsByIds(["p16", "p07", "p11", "p05"]);

const categoryLabels = {
  stationery: "문구",
  digital: "디지털",
  room: "룸",
  fashion: "패션",
  living: "리빙",
  hobby: "취미",
};

const tones = ["sky", "peach", "yellow", "sage"];

export function Hero() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveIndex(Number((visible.target as HTMLElement).dataset.slideIndex));
        }
      },
      { root: viewport, threshold: [0.6, 0.8] },
    );

    slideRefs.current.forEach((slide) => slide && observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    const nextIndex = (index + heroProducts.length) % heroProducts.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    slideRefs.current[nextIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  return (
    <section className="product-hero" aria-label="추천 상품 프로모션" aria-roledescription="carousel">
      <div className="shell product-hero-carousel">
        <div className="product-hero-viewport" ref={viewportRef}>
          {heroProducts.map((product, index) => (
            <article
              className={`product-hero-grid product-hero-tone-${tones[index]}`}
              data-slide-index={index}
              key={product.id}
              ref={(node) => { slideRefs.current[index] = node; }}
              aria-label={`${index + 1}번째 추천 상품, ${product.name}`}
            >
              <div className="product-hero-copy">
                <p className="product-hero-label">{product.brand}</p>
                <h1>{product.name}</h1>
                <p>{product.shortDescription}</p>
                <div className="product-hero-actions">
                  <Link className="primary-button" href={`/product/${product.slug}`}>상품 보기 {formatPrice(product.salePrice ?? product.price)} <ArrowRight size={18} /></Link>
                  <Link className="secondary-button" href={`/shop?category=${product.category}`}>{categoryLabels[product.category]}</Link>
                </div>
              </div>
              <Link className="product-hero-media" href={`/product/${product.slug}`} aria-label={`${product.name} 상세 보기`}>
                <Image
                  src={assetPath(product.image)}
                  alt={`${product.name} 제품 이미지`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 767px) 100vw, 56vw"
                  style={{ objectPosition: product.imagePosition }}
                />
              </Link>
            </article>
          ))}
        </div>

        <div className="product-hero-controls" aria-label="추천 상품 이동">
          <div className="product-hero-indicators">
            {heroProducts.map((product, index) => (
              <button
                type="button"
                className={activeIndex === index ? "is-active" : ""}
                aria-label={`${product.name} 보기`}
                aria-current={activeIndex === index ? "true" : undefined}
                key={product.id}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <div className="product-hero-arrows">
            <button type="button" aria-label="이전 추천 상품" onClick={() => goTo(activeIndex - 1)}><ArrowLeft size={19} /></button>
            <button type="button" aria-label="다음 추천 상품" onClick={() => goTo(activeIndex + 1)}><ArrowRight size={19} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
