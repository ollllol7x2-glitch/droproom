import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "관리자",
  description: "DROP ROOM 상품, 주문, 고객과 재고를 관리하는 운영 대시보드입니다.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const googleAuthReady = Boolean(
    process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  if (!googleAuthReady) redirect("/account?setup=required&callbackUrl=/admin");

  const session = await auth();
  if (!session?.user) redirect("/account?callbackUrl=/admin");

  const adminEmails = (process.env.AUTH_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = session.user.email?.toLowerCase() || "";

  if (!userEmail || !adminEmails.includes(userEmail)) {
    redirect("/account?error=AccessDenied");
  }

  return (
    <AdminDashboard
      currentUser={{
        name: session.user.name || "운영자",
        email: session.user.email || "",
      }}
    />
  );
}
