import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { UserAccountDashboard } from "@/components/account/UserAccountDashboard";
import { auth, signIn, signOut } from "@/auth";

export const metadata: Metadata = { title: "마이페이지" };

type AccountPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    setup?: string;
  }>;
};

const googleAuthReady = Boolean(
  process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

function safeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  return value;
}

async function startGoogleLogin(formData: FormData) {
  "use server";
  if (!googleAuthReady) redirect("/account?setup=required");
  await signIn("google", { redirectTo: safeRedirect(formData.get("callbackUrl")) });
}

async function logout(_formData: FormData) {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const callbackUrl = safeRedirect(params.callbackUrl ?? null);
  const session = googleAuthReady ? await auth() : null;

  if (session?.user) {
    if (callbackUrl !== "/account") redirect(callbackUrl);

    const userName = session.user.name || "DROP ROOM 회원";
    return (
      <UserAccountDashboard
        identity={{
          id: session.user.email || userName,
          name: userName,
          email: session.user.email || "",
          image: session.user.image,
        }}
        persistence="browser"
        signOutAction={logout}
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

        {(params.setup === "required" || !googleAuthReady) && (
          <div className="auth-setup-notice" role="status">
            <strong>OAuth 설정이 필요합니다.</strong>
            <span>환경 변수와 Google Cloud 콜백 주소를 등록하면 버튼이 활성화됩니다.</span>
          </div>
        )}
        {params.error && (
          <div className="auth-error-notice" role="alert">
            {params.error === "AccessDenied"
              ? "이 Google 계정에는 관리자 권한이 없습니다. 등록된 운영자 계정으로 로그인해 주세요."
              : "로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요."}
          </div>
        )}

        <form action={startGoogleLogin}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button className="google-login-button" type="submit" disabled={!googleAuthReady}>
            <span className="google-mark" aria-hidden="true">G</span>
            Google 계정으로 로그인
          </button>
        </form>
        <span className="auth-consent">
          계속하면 DROP ROOM의 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </span>
        <Link className="auth-browse-link" href="/shop">로그인 없이 둘러보기 <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
