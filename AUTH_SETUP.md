# Google 로그인 설정

1. Google Cloud Console에서 프로젝트를 만들고 OAuth 동의 화면을 구성합니다.
2. 사용자 인증 정보에서 **OAuth 클라이언트 ID > 웹 애플리케이션**을 선택합니다.
3. 로컬 개발용 승인된 리디렉션 URI에 아래 주소를 정확히 등록합니다.

   `http://localhost:3200/api/auth/callback/google`

4. 배포 환경에서는 실제 도메인으로 같은 경로를 등록합니다.

   `https://YOUR_DOMAIN/api/auth/callback/google`

5. `.env.example`을 참고해 프로젝트 루트의 `.env.local`에 아래 값을 입력합니다.

   - `AUTH_SECRET`: 충분히 긴 무작위 문자열
   - `AUTH_GOOGLE_ID`: Google OAuth 클라이언트 ID
   - `AUTH_GOOGLE_SECRET`: Google OAuth 클라이언트 보안 비밀번호
   - `AUTH_TRUST_HOST`: 로컬 미리보기나 리버스 프록시 환경에서는 `true`
   - `AUTH_ADMIN_EMAILS`: 관리자 화면 접근을 허용할 Google 이메일. 여러 개는 쉼표로 구분

6. 개발 서버를 다시 시작합니다. `/account`에서 로그인할 수 있으며, `AUTH_ADMIN_EMAILS`에 등록된 계정만 `/admin`에 접근할 수 있습니다.

OAuth 보안 비밀번호와 `AUTH_SECRET`은 Git에 커밋하지 마세요.
