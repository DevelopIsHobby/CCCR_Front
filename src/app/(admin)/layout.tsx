import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth/session";
import { countUsersByStatus } from "@/lib/db/users";
import "../globals.css";

/*
  관리자 전용 뼈대.
  사이트 쪽과 헤더·푸터를 나눠 쓰지 않으려고 라우트 그룹으로 갈라 두었다.
  주소는 그대로 /admin/… 이고, 이 파일이 그 아래 모든 화면의 최상위 layout 이다.
*/

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | C3R 관리자" },
  /* 관리자 화면은 검색에 잡히지 않게 한다 */
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* 모든 하위 화면이 로그인 검사를 여기서 한 번에 받는다. */
  const session = await getSession();
  if (session?.role !== "admin") redirect("/login?next=/admin");

  /* 사이드바에 붙는 '가입 승인 대기' 숫자 */
  const counts = await countUsersByStatus();

  return (
    <html lang="ko" className={plexMono.variable}>
      <body>
        <a
          href="#admin-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
        >
          본문 바로가기
        </a>
        <AdminShell
          name={session.name}
          email={session.email}
          badges={{ pendingMembers: counts.pending }}
        >
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
