"use client";

import { ArrowRight, LockKey } from "@phosphor-icons/react";
import Link from "next/link";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

export function PagesAdminGate() {
  const { user, loading, error } = useSupabaseUser();

  if (loading) {
    return (
      <div className="shell account-page admin-auth-gate">
        <section className="auth-panel auth-loading-panel" aria-live="polite">
          <span className="auth-panel-label">ADMIN</span>
          <h1>접속 권한을 확인하고 있어요.</h1>
          <p>로그인 정보를 안전하게 확인하는 중입니다.</p>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell account-page admin-auth-gate">
        <section className="auth-panel">
          <span className="admin-gate-icon" aria-hidden="true"><LockKey size={30} weight="duotone" /></span>
          <span className="auth-panel-label">ADMIN ONLY</span>
          <h1>Google 로그인이 필요합니다.</h1>
          <p>관리자 데모는 로그인한 계정에서만 확인할 수 있습니다.</p>
          {error && <div className="auth-error-notice" role="alert">{error}</div>}
          <Link className="auth-primary-link" href="/account?callbackUrl=/admin">
            Google 로그인으로 이동 <ArrowRight size={19} />
          </Link>
          <Link className="auth-browse-link" href="/shop">쇼핑몰로 돌아가기</Link>
        </section>
      </div>
    );
  }

  const name = user.user_metadata.full_name || user.user_metadata.name || "운영자";
  return <AdminDashboard currentUser={{ name: String(name), email: user.email || "" }} />;
}
