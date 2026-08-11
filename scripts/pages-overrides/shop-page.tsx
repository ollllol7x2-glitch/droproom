import type { Metadata } from "next";
import { Suspense } from "react";
import { StaticShopPage } from "@/components/commerce/StaticShopPage";

export const metadata: Metadata = { title: "상품 둘러보기" };

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <StaticShopPage />
    </Suspense>
  );
}
