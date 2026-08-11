"use client";

import { Bag } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/commerce/StoreProvider";
import { getProductsByIds } from "@/data/products";
import { formatPrice } from "@/lib/format";

const setItems = getProductsByIds(["p02", "p03", "p14"]);
const setTotal = setItems.reduce((sum, item) => sum + (item.salePrice ?? item.price), 0);

export function ReadySet() {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const addSet = () => {
    setItems.forEach((item) => addToCart(item.id));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <section className="ready-set" id="set">
      <div className="shell ready-set-grid">
        <div className="ready-set-copy">
          <h2>책상 리프레시 세트</h2>
          <p>필기구, 클립, 머그를 한 번에. 함께 쓰기 좋은 세 가지만 골랐습니다.</p>
          <ul>
            {setItems.map((item) => (
              <li key={item.id}>
                <Link href={`/product/${item.slug}`}>{item.name}</Link>
                <span>{formatPrice(item.salePrice ?? item.price)}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={addSet}>
            <Bag size={19} /> {added ? "장바구니에 담았습니다" : `세트 담기 ${formatPrice(setTotal)}`}
          </button>
        </div>
        <div className="ready-set-images">
          {setItems.map((item) => (
            <Link href={`/product/${item.slug}`} key={item.id} aria-label={`${item.name} 상세 보기`}>
              <span className="ready-set-image">
                <Image src={item.image} alt={`${item.name} 제품 이미지`} fill sizes="(max-width: 767px) 78vw, (max-width: 1024px) 31vw, 24vw" style={{ objectFit: "cover", objectPosition: item.imagePosition }} />
              </span>
              <span className="ready-set-item-info">
                <small>{item.brand}</small>
                <strong>{item.name}</strong>
                <span>{formatPrice(item.salePrice ?? item.price)}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
