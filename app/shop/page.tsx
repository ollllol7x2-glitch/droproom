import type { Metadata } from "next";
import { ShopClient } from "@/components/commerce/ShopClient";

export const metadata: Metadata = { title: "상품 둘러보기" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  return <ShopClient initialCategory={value("category")} initialQuery={value("q")} initialSort={value("sort")} initialMax={value("max") ? Number(value("max")) : undefined} />;
}
