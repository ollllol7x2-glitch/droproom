import type { Metadata } from "next";
import localFont from "next/font/local";
import type { CSSProperties } from "react";
import "./globals.css";
import { StoreProvider } from "@/components/commerce/StoreProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { assetPath } from "@/lib/assets";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: { default: "DROP ROOM | 취향 좋은 디자인 생활", template: "%s | DROP ROOM" },
  description: "문구, 디지털 소품, 패션 액세서리와 룸데코를 매주 새롭게 소개하는 디자인 라이프스타일 편집숍입니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const assetVariables = {
    "--brand-header-image": `url("${assetPath("/brand/drop-room-header.svg")}")`,
    "--brand-lockup-image": `url("${assetPath("/brand/drop-room-lockup.svg")}")`,
    "--brand-symbol-image": `url("${assetPath("/brand/drop-room-symbol.svg")}")`,
    "--hero-poster-image": `url("${assetPath("/images/drop-room-v2/hero-dream-room.webp")}")`,
  } as CSSProperties;

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={pretendard.variable} style={assetVariables}>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
