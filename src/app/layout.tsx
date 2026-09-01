import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollTop from "@/components/ScrollTop";
import VisitLogger from "@/components/VisitLogger";
import { getSession } from "@/lib/auth/session";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "한국클라우드컴퓨팅연구조합 | C3R",
    template: "%s | 한국클라우드컴퓨팅연구조합",
  },
  description:
    "한국클라우드컴퓨팅연구조합(C3R)은 클라우드컴퓨팅산업이 4차 산업 및 지능정보사회로의 도약에 기여할 수 있도록 공동 연구개발과 인력양성을 지원합니다.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* 헤더가 로그인 상태를 보여줘야 하므로 여기서 세션을 한 번 읽는다. */
  const session = await getSession();

  return (
    <html lang="ko" className={plexMono.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
        >
          본문 바로가기
        </a>
        <Header session={session} />
        <main id="main">{children}</main>
        <Footer />
        <ScrollTop />
        <VisitLogger />
      </body>
    </html>
  );
}
