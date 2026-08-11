import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ items }: { items: Product[] }) {
  return <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
