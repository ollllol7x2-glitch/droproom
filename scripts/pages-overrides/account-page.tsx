import type { Metadata } from "next";
import { PagesAccount } from "@/components/auth/PagesAccount";

export const metadata: Metadata = { title: "마이페이지" };

export default function AccountPage() {
  return <PagesAccount />;
}
