"use client";

import { useSearchParams } from "next/navigation";
import { ShopClient } from "@/components/commerce/ShopClient";

export function StaticShopPage() {
  const params = useSearchParams();
  const max = params.get("max");

  return (
    <ShopClient
      key={params.toString()}
      initialCategory={params.get("category") ?? undefined}
      initialQuery={params.get("q") ?? undefined}
      initialSort={params.get("sort") ?? undefined}
      initialMax={max ? Number(max) : undefined}
    />
  );
}
