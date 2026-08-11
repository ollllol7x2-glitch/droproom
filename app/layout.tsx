import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/commerce/StoreProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "DROP ROOM | 취향 좋은 디자인 생활", template: "%s | DROP ROOM" },
  description: "문구, 디지털 소품, 패션 액세서리와 룸데코를 매주 새롭게 소개하는 디자인 라이프스타일 편집숍입니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
