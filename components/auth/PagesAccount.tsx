"use client";

import { ArrowRight, Check } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAccountDashboard } from "@/components/account/UserAccountDashboard";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

function readCallbackUrl() {
  const value = new URLSearchParams(window.location.search).get("callbackUrl");
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function PagesAccount() {
  const { user, loading, error, configured, signInWithGoogle, signOut } = useSupabaseUser();
  const [callbackUrl, setCallbackUrl] = useState("/account");

  useEffect(() => {
    setCallbackUrl(readCallbackUrl());
  }, []);

  useEffect(() => {
    if (!user) return;
    const destination = window.sessionStorage.getItem("droproom:auth-callback");
    if (!destination || destination === "/account" || !destination.startsWith("/") || destination.startsWith("//")) {
      return;
    }

    window.sessionStorage.removeItem("droproom:auth-callback");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    window.location.replace(`${basePath}${destination}`);
  }, [user]);

  if (loading) {
    return (
      <div className="shell account-page auth-account-page">
        <div className="auth-intro">
          <p>MY DROP ROOM</p>
          <h1>계정을 확인하고 있어요.</h1>
          <span>로그인 정보를 안전하게 불러오는 중입니다.</span>
        </div>
        <section className="auth-panel auth-loading-panel" aria-live="polite">
          <span className="auth-panel-label">CONNECTING</span>
          <h2>잠시만 기다려 주세요.</h2>
        </section>
      </div>
    );
  }

  if (user) {
    const userName = user.user_metadata.full_name || user.user_metadata.name || "DROP ROOM 회원";
    const userImage = user.user_metadata.avatar_url || user.user_metadata.picture;

    return (
      <UserAccountDashboard
        identity={{
          id: user.id,
          name: String(userName),
          email: user.email || "",
          image: userImage ? String(userImage) : null,
          metadata: user.user_metadata,
        }}
        persistence="supabase"
        onSignOut={signOut}
      />
    );
  }

  return (
    <div className="shell account-page auth-account-page">
      <div className="auth-intro">
        <p>MY DROP ROOM</p>
        <h1>취향을 모으는 가장 간단한 방법.</h1>
        <span>
          Google 계정 하나로 찜한 상품과 저장한 배송지를 안전하게 이어서 확인하세요.
          비밀번호를 새로 만들 필요가 없습니다.
        </span>
        <ul className="auth-benefits" aria-label="로그인 혜택">
          <li><Check size={18} weight="bold" /> 찜 목록과 장바구니 이어보기</li>
          <li><Check size={18} weight="bold" /> 내 정보와 배송지 한곳에서 관리</li>
          <li><Check size={18} weight="bold" /> 신상품과 DROP 알림 받기</li>
        </ul>
      </div>

      <section className="auth-panel" aria-label="Google 로그인">
        <span className="auth-panel-label">WELCOME</span>
        <h2>Google로 계속하기</h2>
        <p>Google에서 이름, 이메일, 프로필 이미지만 전달받습니다.</p>

        {error && <div className="auth-error-notice" role="alert">{error}</div>}
        {!configured && (
          <div className="auth-setup-notice" role="status">
            <strong>로그인 설정을 확인해 주세요.</strong>
            <span>공개 인증 설정이 누락되어 Google 로그인을 시작할 수 없습니다.</span>
          </div>
        )}

        <button
          className="google-login-button"
          type="button"
          disabled={!configured}
          onClick={() => void signInWithGoogle(callbackUrl)}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          Google 계정으로 로그인
        </button>
        <span className="auth-consent">
          계속하면 DROP ROOM의 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </span>
        <Link className="auth-browse-link" href="/shop">로그인 없이 둘러보기 <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
