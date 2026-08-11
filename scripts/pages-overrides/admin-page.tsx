import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "관리자 데모",
  description: "DROP ROOM 정적 관리자 대시보드 미리보기입니다.",
};

export default function AdminPage() {
  return (
    <AdminDashboard
      currentUser={{
        name: "데모 운영자",
        email: "GitHub Pages 미리보기",
      }}
    />
  );
}
