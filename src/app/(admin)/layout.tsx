import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth/session";
import { countUsersByStatus } from "@/lib/db/users";
import { countNewProposals, countPendingNotices } from "@/lib/db/outreach";
import { countTrash } from "@/lib/db/trash";
import { inspectionOverdue, lastInspection } from "@/lib/db/admin-access";
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

  /* 사이드바에 붙는 '가입 승인 대기'·'새 제안' 숫자 */
  const [counts, newProposals, pendingNotices, trash, inspected] = await Promise.all([
    countUsersByStatus(),
    countNewProposals(),
    countPendingNotices(),
    countTrash(),
    lastInspection(),
  ]);

  return (
    <html lang="ko" className={plexMono.variable}>
      <head>
        {/*
          본문 글꼴. HTML 에 두어야 브라우저가 곧바로 찾아 나선다.
          globals.css 안에 @import 로 두면 그 파일을 다 받아 파싱한 뒤에야
          출발하므로, 처음 오는 사람에게는 그만큼 글자가 늦게 자리잡는다.
          preconnect 로 주소 찾기와 암호화 악수를 미리 해 둔다.
        */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
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
          badges={{
            pendingMembers: counts.pending,
            newProposals,
            pendingNotices,
            trash,
            /* 월 1회 점검(안전성 확보조치 기준 제8조)이 밀렸으면 사이드바에 표시 */
            inspection: inspectionOverdue(inspected) ? 1 : 0,
          }}
        >
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
