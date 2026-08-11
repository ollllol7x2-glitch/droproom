import type { Metadata } from "next";
import { WishlistClient } from "@/components/commerce/WishlistClient";
export const metadata: Metadata = { title: "찜한 물건" };
export default function WishlistPage() { return <WishlistClient />; }
