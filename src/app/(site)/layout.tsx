import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollTop from "@/components/ScrollTop";
import VisitLogger from "@/components/VisitLogger";
import { getSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/db/site-settings";
import { siteUrl } from "@/lib/site-url";
import "../globals.css";

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  /* 상대 주소로 적은 그림·링크가 절대 주소로 바뀐다. 공유 카드에 필요하다. */
  metadataBase: new URL(siteUrl()),
  title: {
    default: "한국클라우드컴퓨팅연구조합 | C3R",
    template: "%s | 한국클라우드컴퓨팅연구조합",
  },
  description:
    "한국클라우드컴퓨팅연구조합(C3R)은 클라우드컴퓨팅산업이 4차 산업 및 지능정보사회로의 도약에 기여할 수 있도록 공동 연구개발과 인력양성을 지원합니다.",
  /*
    미리보기 배포는 검색에 잡히면 안 된다. 정식 공개 전 주소가 색인되면
    나중에 진짜 주소와 내용이 겹쳐 검색 순위에도 손해다.
    SITE_NOINDEX=1 을 넣은 곳에서만 막고, 값이 없으면 평소대로 색인된다.
  */
  robots:
    process.env.SITE_NOINDEX === "1" ? { index: false, follow: false } : undefined,
  /*
    링크를 공유했을 때 뜨는 카드. 이것이 없으면 카카오톡·페이스북에 회색 상자만 나온다.

    그림은 미리 만들어 둔 파일(public/og-cover.png)을 쓴다. next/og 로 그때그때
    그리는 방법도 있지만, 한글 글꼴을 함께 실어야 하고 서버마다 되고 안 되고가
    갈린다. 카드 그림은 자주 바뀌지 않으니 파일 하나가 낫다.
    바꾸려면 같은 이름으로 1200x630 그림을 덮어쓰면 된다.
  */
  openGraph: {
    type: "website",
    siteName: "한국클라우드컴퓨팅연구조합",
    locale: "ko_KR",
    url: siteUrl(),
    images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "한국클라우드컴퓨팅연구조합 C3R" }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* 헤더가 로그인 상태를 보여줘야 하므로 여기서 세션을 한 번 읽는다. */
  const [session, site] = await Promise.all([getSession(), getSiteSettings()]);

  return (
    <html lang="ko" className={plexMono.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
        >
          본문 바로가기
        </a>
        <Header session={session} site={site} />
        <main id="main">{children}</main>
        <Footer />
        <ScrollTop />
        <VisitLogger />
      </body>
    </html>
  );
}
