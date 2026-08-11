import type { Metadata } from "next";
import { CheckoutClient } from "@/components/commerce/CheckoutClient";
export const metadata: Metadata = { title: "주문서" };
export default function CheckoutPage() { return <CheckoutClient />; }
