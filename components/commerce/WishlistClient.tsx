"use client";

import { Heart } from "@phosphor-icons/react";
import Link from "next/link";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { useStore } from "@/components/commerce/StoreProvider";
import { getProductsByIds } from "@/data/products";

export function WishlistClient() {
  const { wishlist } = useStore();
  const items = getProductsByIds(wishlist);

  return (
    <div className="shell utility-page">
      <header><p>MY PICKS</p><h1>찜한 물건</h1><span>{items.length}개를 저장했습니다.</span></header>
      {items.length > 0 ? <ProductGrid items={items} /> : <div className="empty-state"><Heart size={36} /><h2>아직 찜한 물건이 없어요</h2><p>마음에 드는 상품의 하트를 눌러 모아보세요.</p><Link href="/shop">상품 둘러보기</Link></div>}
    </div>
  );
}
